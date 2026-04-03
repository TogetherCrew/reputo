import { type INestApplication, UnauthorizedException, VersioningType } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdAuthController } from '../../../src/auth/auth.controller';
import { DeepIdAuthService } from '../../../src/auth/deep-id-auth.service';
import { SessionAuthGuard } from '../../../src/shared/guards/session-auth.guard';
import { setAuthRequestContext } from '../../../src/shared/types';

const userId = new Types.ObjectId();

const MOCK_SESSION_VIEW = {
  authenticated: true,
  provider: 'deep-id' as const,
  expiresAt: '2026-05-02T10:00:00.000Z',
  scope: ['openid', 'profile', 'email', 'offline_access'],
  user: {
    id: userId.toString(),
    provider: 'deep-id' as const,
    sub: 'did:deep-id:123',
    email: 'jane@example.com',
    username: 'jane',
  },
};

const MOCK_AUTH_CONTEXT = {
  session: {
    _id: new Types.ObjectId(),
    sessionId: 'session-123',
    provider: 'deep-id' as const,
    userId,
    accessTokenExpiresAt: new Date('2026-05-02T10:00:00.000Z'),
    refreshTokenExpiresAt: new Date('2026-06-02T10:00:00.000Z'),
    scope: ['openid', 'profile', 'email', 'offline_access'],
    expiresAt: new Date('2026-06-02T10:00:00.000Z'),
    createdAt: new Date('2026-04-03T10:00:00.000Z'),
    updatedAt: new Date('2026-04-03T10:00:00.000Z'),
  },
  user: {
    _id: userId,
    provider: 'deep-id' as const,
    sub: 'did:deep-id:123',
    email: 'jane@example.com',
    email_verified: true,
    username: 'jane',
    createdAt: new Date('2026-04-03T10:00:00.000Z'),
    updatedAt: new Date('2026-04-03T10:00:00.000Z'),
  },
};

describe('DeepIdAuthController (e2e)', () => {
  let app: INestApplication;
  const deepIdAuthService = {
    getLoginRedirectUrl: vi.fn(),
    handleCallback: vi.fn(),
    getCurrentSession: vi.fn(),
    requireSession: vi.fn(),
    logout: vi.fn(),
    toCurrentSessionView: vi.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [DeepIdAuthController],
      providers: [
        {
          provide: DeepIdAuthService,
          useValue: deepIdAuthService,
        },
        Reflector,
        {
          provide: APP_GUARD,
          useFactory: (reflector: Reflector) => new SessionAuthGuard(reflector, deepIdAuthService as any),
          inject: [Reflector],
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/auth/deep-id/login', () => {
    it('returns a 302 redirect to the Deep ID authorization URL', async () => {
      deepIdAuthService.getLoginRedirectUrl.mockResolvedValue('https://identity.deep-id.ai/oauth2/auth?state=abc');

      const response = await request(app.getHttpServer()).get('/api/v1/auth/deep-id/login');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('https://identity.deep-id.ai/oauth2/auth?state=abc');
      expect(deepIdAuthService.requireSession).not.toHaveBeenCalled();
    });

    it('is a public route that does not require a session', async () => {
      deepIdAuthService.getLoginRedirectUrl.mockResolvedValue('https://example.com');

      const response = await request(app.getHttpServer()).get('/api/v1/auth/deep-id/login');

      expect(response.status).toBe(302);
      expect(deepIdAuthService.requireSession).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/auth/deep-id/callback', () => {
    it('returns a 302 redirect on successful callback', async () => {
      deepIdAuthService.handleCallback.mockResolvedValue('http://localhost:5173');

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/deep-id/callback')
        .query({ code: 'auth-code', state: 'state-123' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('http://localhost:5173');
      expect(deepIdAuthService.requireSession).not.toHaveBeenCalled();
    });

    it('returns 401 when state is invalid', async () => {
      deepIdAuthService.handleCallback.mockRejectedValue(new UnauthorizedException('Deep ID auth state mismatch.'));

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/deep-id/callback')
        .query({ code: 'code', state: 'wrong-state' });

      expect(response.status).toBe(401);
    });

    it('is a public route that does not require a session', async () => {
      deepIdAuthService.handleCallback.mockResolvedValue('http://localhost:5173');

      await request(app.getHttpServer()).get('/api/v1/auth/deep-id/callback').query({ code: 'code', state: 'state' });

      expect(deepIdAuthService.requireSession).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/auth/deep-id/me', () => {
    it('returns 200 with the session bootstrap payload when authenticated', async () => {
      deepIdAuthService.requireSession.mockImplementation(async (req: any) => {
        setAuthRequestContext(req, MOCK_AUTH_CONTEXT as any);
        return MOCK_AUTH_CONTEXT;
      });
      deepIdAuthService.toCurrentSessionView.mockReturnValue(MOCK_SESSION_VIEW);

      const response = await request(app.getHttpServer()).get('/api/v1/auth/deep-id/me');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        authenticated: true,
        provider: 'deep-id',
        user: {
          sub: 'did:deep-id:123',
          email: 'jane@example.com',
        },
      });
    });

    it('returns 401 when no session cookie is present', async () => {
      deepIdAuthService.requireSession.mockRejectedValue(new UnauthorizedException('Authentication required.'));

      const response = await request(app.getHttpServer()).get('/api/v1/auth/deep-id/me');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/deep-id/logout', () => {
    it('returns 204 when the session is successfully revoked', async () => {
      deepIdAuthService.requireSession.mockImplementation(async (req: any) => {
        setAuthRequestContext(req, MOCK_AUTH_CONTEXT as any);
        return MOCK_AUTH_CONTEXT;
      });
      deepIdAuthService.logout.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer()).post('/api/v1/auth/deep-id/logout');

      expect(response.status).toBe(204);
      expect(deepIdAuthService.logout).toHaveBeenCalledWith(MOCK_AUTH_CONTEXT.session, expect.anything());
    });

    it('returns 401 when not authenticated', async () => {
      deepIdAuthService.requireSession.mockRejectedValue(new UnauthorizedException('Authentication required.'));

      const response = await request(app.getHttpServer()).post('/api/v1/auth/deep-id/logout');

      expect(response.status).toBe(401);
    });
  });
});
