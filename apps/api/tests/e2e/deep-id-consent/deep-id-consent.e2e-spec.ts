import type { INestApplication } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { AuthSession, DeepIdGrant, DeepIdUser } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { Model } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import supertest from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DeepIdAuthModule } from '../../../src/auth';
import { configModules } from '../../../src/config';
import { DeepIdConsentModule } from '../../../src/deep-id-consent';
import { HttpExceptionFilter } from '../../../src/shared/filters/http-exception.filter';
import { createPkceChallenge } from '../../../src/shared/utils';
import { applyAuthTestEnv } from '../../utils/auth-session';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { base } from '../../utils/request';

const DISCOVERY_DOCUMENT = {
  issuer: 'https://identity.deep-id.ai',
  authorization_endpoint: 'https://identity.deep-id.ai/oauth2/auth',
  token_endpoint: 'https://identity.deep-id.ai/oauth2/token',
  userinfo_endpoint: 'https://identity.deep-id.ai/userinfo',
};

type FetchRequest = {
  init?: RequestInit;
  url: string;
};

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getFetchUrl(input: RequestInfo | URL): string {
  if (input instanceof URL) {
    return input.toString();
  }

  if (typeof input === 'string') {
    return input;
  }

  return input.url;
}

describe('Deep ID consent e2e', () => {
  let app: INestApplication;
  let deepIdGrantModel: Model<DeepIdGrant>;
  let authSessionModel: Model<AuthSession>;
  let deepIdUserModel: Model<DeepIdUser>;
  let tokenRequests: FetchRequest[] = [];
  let userinfoRequests: FetchRequest[] = [];
  let tokenStatus = 200;
  let tokenBody: string | Record<string, unknown> = {
    access_token: 'provider-access-token',
    refresh_token: 'provider-refresh-token',
    expires_in: 300,
    token_type: 'Bearer',
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = getFetchUrl(input);

    if (url === 'https://identity.deep-id.ai/.well-known/openid-configuration') {
      return jsonResponse(DISCOVERY_DOCUMENT);
    }

    if (url === DISCOVERY_DOCUMENT.token_endpoint) {
      tokenRequests.push({ url, init });
      const body = typeof tokenBody === 'string' ? tokenBody : JSON.stringify(tokenBody);
      return new Response(body, {
        status: tokenStatus,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url === DISCOVERY_DOCUMENT.userinfo_endpoint) {
      userinfoRequests.push({ url, init });
      return jsonResponse({});
    }

    return new Response('Not found', { status: 404 });
  });

  async function startDeepIdConsentFlow() {
    const response = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent'))
      .query({ source: 'voting-portal' })
      .expect(302);
    const redirectUrl = new URL(response.headers.location);
    const state = redirectUrl.searchParams.get('state');

    expect(state).toBeTruthy();

    return {
      redirectUrl,
      state: state as string,
    };
  }

  beforeAll(async () => {
    applyAuthTestEnv();
    vi.stubGlobal('fetch', fetchMock);

    const mongoUri = await startMongo();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: configModules,
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        LoggerModule.forRoot({
          pinoHttp: {
            level: 'silent',
          },
        }),
        MongooseModule.forRoot(mongoUri),
        DeepIdAuthModule,
        DeepIdConsentModule,
      ],
    }).compile();

    deepIdGrantModel = moduleRef.get(getModelToken(MODEL_NAMES.DEEP_ID_GRANT));
    authSessionModel = moduleRef.get(getModelToken(MODEL_NAMES.AUTH_SESSION));
    deepIdUserModel = moduleRef.get(getModelToken(MODEL_NAMES.DEEP_ID_USER));
    app = moduleRef.createNestApplication();

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    await app.init();
  });

  afterEach(async () => {
    expect(userinfoRequests).toHaveLength(0);
    expect(await authSessionModel.countDocuments()).toBe(0);
    expect(await deepIdUserModel.countDocuments()).toBe(0);

    tokenRequests = [];
    userinfoRequests = [];
    tokenStatus = 200;
    tokenBody = {
      access_token: 'provider-access-token',
      refresh_token: 'provider-refresh-token',
      expires_in: 300,
      token_type: 'Bearer',
    };
    fetchMock.mockClear();

    await Promise.all([
      deepIdGrantModel.deleteMany({}),
      authSessionModel.deleteMany({}),
      deepIdUserModel.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    if (app) {
      await app.close();
    }
    await stopMongo();
  });

  it('rejects missing and unknown sources without redirecting', async () => {
    await supertest(app.getHttpServer()).get(base('/deep-id/consent')).expect(400);
    await supertest(app.getHttpServer()).get(base('/deep-id/consent')).query({ source: 'unknown-source' }).expect(400);

    expect(tokenRequests).toHaveLength(0);
    expect(await deepIdGrantModel.countDocuments()).toBe(0);
  });

  it('starts the consent flow and persists a transient DeepIdGrant', async () => {
    const { redirectUrl, state } = await startDeepIdConsentFlow();

    expect(redirectUrl.origin).toBe('https://identity.deep-id.ai');
    expect(redirectUrl.pathname).toBe('/oauth2/auth');
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('client_id')).toBe('deep-id-test-client');
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/v1/deep-id/consent/callback');
    expect(redirectUrl.searchParams.get('scope')).toBe('api wallets');
    expect(redirectUrl.searchParams.get('state')).toBe(state);
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');

    const storedGrant = await deepIdGrantModel.findOne({ state }).select('+codeVerifier').lean();

    expect(storedGrant).toMatchObject({
      source: 'voting-portal',
      state,
    });
    expect(storedGrant?.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(redirectUrl.searchParams.get('code_challenge')).toBe(createPkceChallenge(storedGrant?.codeVerifier ?? ''));
    expect(storedGrant?.expiresAt.getTime()).toBeGreaterThan(Date.now() + 590_000);
    expect(storedGrant?.expiresAt.getTime()).toBeLessThan(Date.now() + 610_000);
  });

  it('exchanges the callback code, deletes the grant, and redirects to success', async () => {
    const { state } = await startDeepIdConsentFlow();

    const callbackResponse = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ code: 'authorization-code', state, scope: 'api wallets profile' })
      .expect(302);

    expect(callbackResponse.headers.location).toBe('http://localhost:3001/voting?reputo_connected=success');
    expect(tokenRequests).toHaveLength(1);

    const tokenRequest = tokenRequests[0];
    const headers = tokenRequest.init?.headers as Record<string, string>;
    const body = new URLSearchParams(tokenRequest.init?.body as URLSearchParams);

    expect(headers.Authorization).toBe(
      `Basic ${Buffer.from('deep-id-test-client:deep-id-test-secret', 'utf8').toString('base64')}`,
    );
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('authorization-code');
    expect(body.get('redirect_uri')).toBe('http://localhost:3000/api/v1/deep-id/consent/callback');
    expect(body.get('code_verifier')).toBeTruthy();
    expect(await deepIdGrantModel.countDocuments()).toBe(0);

    await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ code: 'authorization-code', state })
      .expect(400)
      .expect('Content-Type', /html/u);
  });

  it('maps access_denied to denied_consent and deletes the grant without a token request', async () => {
    const { state } = await startDeepIdConsentFlow();

    const callbackResponse = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ error: 'access_denied', error_description: 'User denied consent', state })
      .expect(302);

    expect(callbackResponse.headers.location).toBe(
      'http://localhost:3001/voting?reputo_connected=error&reason=denied_consent',
    );
    expect(tokenRequests).toHaveLength(0);
    expect(await deepIdGrantModel.countDocuments()).toBe(0);
  });

  it('maps token endpoint failures to provider_error and deletes the grant', async () => {
    tokenStatus = 500;
    tokenBody = { error: 'server_error' };
    const { state } = await startDeepIdConsentFlow();

    const callbackResponse = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ code: 'authorization-code', state })
      .expect(302);

    expect(callbackResponse.headers.location).toBe(
      'http://localhost:3001/voting?reputo_connected=error&reason=provider_error',
    );
    expect(tokenRequests).toHaveLength(1);
    expect(await deepIdGrantModel.countDocuments()).toBe(0);
  });

  it('returns 400 HTML for unknown and expired states without redirecting', async () => {
    const unknownResponse = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ code: 'authorization-code', state: 'unknown-state' })
      .expect(400)
      .expect('Content-Type', /html/u);

    expect(unknownResponse.headers.location).toBeUndefined();

    await deepIdGrantModel.create({
      source: 'voting-portal',
      state: 'expired-state',
      codeVerifier: 'expired-verifier',
      expiresAt: new Date(Date.now() - 1_000),
    });

    const expiredResponse = await supertest(app.getHttpServer())
      .get(base('/deep-id/consent/callback'))
      .query({ code: 'authorization-code', state: 'expired-state' })
      .expect(400)
      .expect('Content-Type', /html/u);

    expect(expiredResponse.headers.location).toBeUndefined();
    expect(await deepIdGrantModel.countDocuments()).toBe(0);
  });

  it('creates the required TTL index for stale grants', async () => {
    await deepIdGrantModel.syncIndexes();

    const indexes = await deepIdGrantModel.collection.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }),
      ]),
    );
  });
});
