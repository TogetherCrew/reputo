import type { INestApplication } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { AuthSession, DeepIdUser } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { Model } from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import supertest from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DeepIdAuthModule } from '../../../src/auth';
import { DeepIdOAuthService } from '../../../src/auth/deep-id-oauth.service';
import { DeepIdTokenValidationService } from '../../../src/auth/deep-id-token-validation.service';
import { configModules } from '../../../src/config';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { base } from '../../utils/request';

const TEST_ENV = {
  NODE_ENV: 'test',
  DEEP_ID_ISSUER_URL: 'https://identity.deep-id.ai',
  DEEP_ID_CLIENT_ID: 'deep-id-test-client',
  DEEP_ID_CLIENT_SECRET: 'deep-id-test-secret',
  DEEP_ID_REDIRECT_URI: 'http://localhost:3000/api/v1/auth/deep-id/callback',
  DEEP_ID_SCOPES: 'openid profile email offline_access',
  AUTH_COOKIE_NAME: 'reputo_test_session',
  AUTH_COOKIE_DOMAIN: '',
  AUTH_COOKIE_SECURE: 'false',
  AUTH_COOKIE_SAME_SITE: 'lax',
  AUTH_SESSION_TTL_SECONDS: '3600',
  AUTH_REFRESH_LEEWAY_SECONDS: '60',
  AUTH_TOKEN_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef',
  APP_PUBLIC_URL: 'http://localhost:5173',
} as const;

describe('Deep ID auth e2e', () => {
  let app: INestApplication;
  let authSessionModel: Model<AuthSession>;
  let deepIdUserModel: Model<DeepIdUser>;

  const mockOAuthService = {
    buildAuthorizationUrl: vi.fn(async (flow: { state: string }) => {
      const url = new URL('https://identity.deep-id.ai/oauth2/auth');
      url.searchParams.set('state', flow.state);
      return url.toString();
    }),
    exchangeCodeForTokens: vi.fn(),
    refreshTokens: vi.fn(),
    fetchUserInfo: vi.fn(),
    getDiscoveryDocument: vi.fn(),
    getJwks: vi.fn(),
  };

  const mockTokenValidationService = {
    validateIdToken: vi.fn(),
  };

  beforeAll(async () => {
    for (const [key, value] of Object.entries(TEST_ENV)) {
      process.env[key] = value;
    }

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
      ],
    })
      .overrideProvider(DeepIdOAuthService)
      .useValue(mockOAuthService)
      .overrideProvider(DeepIdTokenValidationService)
      .useValue(mockTokenValidationService)
      .compile();

    authSessionModel = moduleRef.get(getModelToken(MODEL_NAMES.AUTH_SESSION));
    deepIdUserModel = moduleRef.get(getModelToken(MODEL_NAMES.DEEP_ID_USER));
    app = moduleRef.createNestApplication();

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
    vi.clearAllMocks();
    await Promise.all([authSessionModel.deleteMany({}), deepIdUserModel.deleteMany({})]);
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('starts the login flow and redirects to Deep ID', async () => {
    const agent = supertest.agent(app.getHttpServer());

    const response = await agent.get(base('/auth/deep-id/login')).expect(302);
    const redirectUrl = new URL(response.headers.location);

    expect(redirectUrl.origin).toBe('https://identity.deep-id.ai');
    expect(redirectUrl.pathname).toBe('/oauth2/auth');
    expect(redirectUrl.searchParams.get('state')).toBeTruthy();
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining(`${TEST_ENV.AUTH_COOKIE_NAME}.flow=`)]),
    );
  });

  it('completes the callback flow, syncs the user, creates the session, and bootstraps /me', async () => {
    const agent = supertest.agent(app.getHttpServer());

    mockOAuthService.exchangeCodeForTokens.mockResolvedValue({
      access_token: 'provider-access-token',
      refresh_token: 'provider-refresh-token',
      id_token: 'provider-id-token',
      expires_in: 300,
      refresh_token_expires_in: 1800,
      token_type: 'Bearer',
      scope: 'openid profile email offline_access',
    });
    mockTokenValidationService.validateIdToken.mockImplementation(async (_token: string, nonce: string) => ({
      iss: TEST_ENV.DEEP_ID_ISSUER_URL,
      sub: 'did:deep-id:123',
      aud: TEST_ENV.DEEP_ID_CLIENT_ID,
      exp: Math.floor(Date.now() / 1000) + 300,
      nonce,
      amr: ['pwd'],
    }));
    mockOAuthService.fetchUserInfo.mockResolvedValue({
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      email_verified: true,
      name: 'Jane Doe',
      given_name: 'Jane',
      family_name: 'Doe',
      picture: 'https://example.com/avatar.png',
      wallet_addresses: ['0xabc'],
      kyc_verified: true,
      amr: ['pwd'],
    });

    const loginResponse = await agent.get(base('/auth/deep-id/login')).expect(302);
    const state = new URL(loginResponse.headers.location).searchParams.get('state');

    expect(state).toBeTruthy();

    const callbackResponse = await agent.get(base(`/auth/deep-id/callback?code=code-123&state=${state}`)).expect(302);

    expect(callbackResponse.headers.location).toBe(TEST_ENV.APP_PUBLIC_URL);
    expect(callbackResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining(`${TEST_ENV.AUTH_COOKIE_NAME}=`)]),
    );

    const storedUser = await deepIdUserModel.findOne({ did: 'did:deep-id:123' }).lean();
    const storedSession = await authSessionModel
      .findOne({})
      .select('+accessTokenCiphertext +refreshTokenCiphertext +nonce +state +codeVerifier')
      .lean();

    expect(storedUser).toMatchObject({
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      emailVerified: true,
      walletAddresses: ['0xabc'],
      kycVerified: true,
    });
    expect(storedSession).toBeTruthy();
    expect(storedSession?.accessTokenCiphertext).not.toBe('provider-access-token');
    expect(storedSession?.refreshTokenCiphertext).not.toBe('provider-refresh-token');
    expect(storedSession?.state).toBe(state);
    expect(storedSession?.nonce).toBeTruthy();
    expect(storedSession?.codeVerifier).toBeTruthy();

    const currentSession = await agent.get(base('/auth/deep-id/me')).expect(200);

    expect(currentSession.body).toMatchObject({
      authenticated: true,
      provider: 'deep-id',
      scope: ['openid', 'profile', 'email', 'offline_access'],
      user: {
        did: 'did:deep-id:123',
        email: 'jane@example.com',
        emailVerified: true,
        walletAddresses: ['0xabc'],
      },
    });
  });

  it('rejects the callback when the state does not match the stored auth flow', async () => {
    const agent = supertest.agent(app.getHttpServer());

    await agent.get(base('/auth/deep-id/login')).expect(302);

    await agent.get(base('/auth/deep-id/callback?code=code-123&state=wrong-state')).expect(401);

    expect(await authSessionModel.countDocuments()).toBe(0);
  });

  it('refreshes provider tokens during /me when the stored access token is close to expiry', async () => {
    const agent = supertest.agent(app.getHttpServer());

    mockOAuthService.exchangeCodeForTokens.mockResolvedValue({
      access_token: 'stale-access-token',
      refresh_token: 'stale-refresh-token',
      id_token: 'provider-id-token',
      expires_in: 5,
      refresh_token_expires_in: 1800,
      token_type: 'Bearer',
      scope: 'openid profile email offline_access',
    });
    mockTokenValidationService.validateIdToken.mockImplementation(async (_token: string, nonce: string) => ({
      iss: TEST_ENV.DEEP_ID_ISSUER_URL,
      sub: 'did:deep-id:refresh',
      aud: TEST_ENV.DEEP_ID_CLIENT_ID,
      exp: Math.floor(Date.now() / 1000) + 300,
      nonce,
      amr: ['pwd'],
    }));
    mockOAuthService.fetchUserInfo.mockResolvedValue({
      did: 'did:deep-id:refresh',
      email: 'refresh@example.com',
      email_verified: true,
      wallet_addresses: ['0xdef'],
      kyc_verified: false,
      amr: ['pwd'],
    });

    const loginResponse = await agent.get(base('/auth/deep-id/login')).expect(302);
    const state = new URL(loginResponse.headers.location).searchParams.get('state');

    await agent.get(base(`/auth/deep-id/callback?code=code-refresh&state=${state}`)).expect(302);

    const storedSession = await authSessionModel.findOne({}).lean();
    expect(storedSession).toBeTruthy();

    await authSessionModel.updateOne(
      { _id: storedSession?._id },
      {
        accessTokenExpiresAt: new Date(Date.now() - 1_000),
      },
    );

    mockOAuthService.refreshTokens.mockResolvedValue({
      access_token: 'fresh-access-token',
      refresh_token: 'fresh-refresh-token',
      expires_in: 300,
      refresh_token_expires_in: 1700,
      token_type: 'Bearer',
      scope: 'openid profile email offline_access',
    });

    const response = await agent.get(base('/auth/deep-id/me')).expect(200);
    const refreshedSession = await authSessionModel
      .findOne({})
      .select('+accessTokenCiphertext +refreshTokenCiphertext')
      .lean();

    expect(response.body.authenticated).toBe(true);
    expect(mockOAuthService.refreshTokens).toHaveBeenCalledTimes(1);
    expect(refreshedSession?.accessTokenCiphertext).not.toBe('fresh-access-token');
    expect(refreshedSession?.refreshTokenCiphertext).not.toBe('fresh-refresh-token');
  });

  it('logs out by clearing the cookie and revoking the stored session', async () => {
    const agent = supertest.agent(app.getHttpServer());

    mockOAuthService.exchangeCodeForTokens.mockResolvedValue({
      access_token: 'provider-access-token',
      refresh_token: 'provider-refresh-token',
      id_token: 'provider-id-token',
      expires_in: 300,
      refresh_token_expires_in: 1800,
      token_type: 'Bearer',
      scope: 'openid profile email offline_access',
    });
    mockTokenValidationService.validateIdToken.mockImplementation(async (_token: string, nonce: string) => ({
      iss: TEST_ENV.DEEP_ID_ISSUER_URL,
      sub: 'did:deep-id:logout',
      aud: TEST_ENV.DEEP_ID_CLIENT_ID,
      exp: Math.floor(Date.now() / 1000) + 300,
      nonce,
      amr: ['pwd'],
    }));
    mockOAuthService.fetchUserInfo.mockResolvedValue({
      did: 'did:deep-id:logout',
      email: 'logout@example.com',
      email_verified: true,
      wallet_addresses: [],
      kyc_verified: false,
      amr: ['pwd'],
    });

    const loginResponse = await agent.get(base('/auth/deep-id/login')).expect(302);
    const state = new URL(loginResponse.headers.location).searchParams.get('state');

    await agent.get(base(`/auth/deep-id/callback?code=code-logout&state=${state}`)).expect(302);

    const activeSession = await authSessionModel.findOne({}).lean();

    expect(activeSession).toBeTruthy();

    const logoutResponse = await agent.post(base('/auth/deep-id/logout')).expect(204);

    expect(logoutResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining(`${TEST_ENV.AUTH_COOKIE_NAME}=;`)]),
    );

    const revokedSession = await authSessionModel.findById(activeSession?._id).lean();
    const currentSession = await agent.get(base('/auth/deep-id/me')).expect(200);

    expect(revokedSession?.revokedAt).toBeTruthy();
    expect(currentSession.body).toEqual({ authenticated: false });
  });
});
