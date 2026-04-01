import { Types } from 'mongoose';
import { beforeEach, describe, expect, test } from 'vitest';
import AuthSessionModel from '../../../src/models/AuthSession.model.js';
import { AUTH_SESSION_PRIVATE_FIELDS, DeepIdProvider } from '../../../src/shared/constants/index.js';
import type { AuthSession } from '../../../src/shared/types/index.js';

describe('AuthSession model', () => {
  describe('AuthSession validation', () => {
    let authSession: AuthSession;

    beforeEach(() => {
      authSession = {
        sessionId: 'session-123',
        provider: DeepIdProvider,
        userId: new Types.ObjectId(),
        accessTokenCiphertext: 'enc:v1:access:deadbeef',
        refreshTokenCiphertext: 'enc:v1:refresh:cafebabe',
        accessTokenExpiresAt: new Date('2026-04-02T10:00:00.000Z'),
        refreshTokenExpiresAt: new Date('2026-05-02T10:00:00.000Z'),
        scope: ['openid', 'profile', 'email', 'offline_access'],
        nonce: 'nonce-123',
        state: 'state-123',
        codeVerifier: 'code-verifier-123',
        expiresAt: new Date('2026-05-02T10:00:00.000Z'),
      };
    });

    test('should correctly validate a valid auth session', async () => {
      const doc = new AuthSessionModel(authSession);

      await expect(doc.validate()).resolves.toBeUndefined();
    });

    test('should persist ciphertext-only token fields behind private defaults', () => {
      const doc = new AuthSessionModel(authSession);
      const serialized = doc.toJSON() as Record<string, unknown>;

      expect(AuthSessionModel.schema.path('accessToken')).toBeUndefined();
      expect(AuthSessionModel.schema.path('refreshToken')).toBeUndefined();
      expect(AuthSessionModel.schema.path('accessTokenCiphertext')?.options.select).toBe(false);
      expect(AuthSessionModel.schema.path('refreshTokenCiphertext')?.options.select).toBe(false);

      for (const field of AUTH_SESSION_PRIVATE_FIELDS) {
        expect(serialized).not.toHaveProperty(field);
      }

      expect(doc.accessTokenCiphertext).toBe(authSession.accessTokenCiphertext);
      expect(doc.refreshTokenCiphertext).toBe(authSession.refreshTokenCiphertext);
    });

    test('should allow rotating encrypted provider tokens', async () => {
      const doc = new AuthSessionModel(authSession);
      const rotatedAt = new Date('2026-04-03T12:00:00.000Z');

      doc.set({
        accessTokenCiphertext: 'enc:v2:access:feedface',
        refreshTokenCiphertext: 'enc:v2:refresh:8badf00d',
        accessTokenExpiresAt: new Date('2026-04-03T10:00:00.000Z'),
        refreshTokenExpiresAt: new Date('2026-06-03T10:00:00.000Z'),
        lastRefreshedAt: rotatedAt,
      });

      await expect(doc.validate()).resolves.toBeUndefined();
      expect(doc.accessTokenCiphertext).toBe('enc:v2:access:feedface');
      expect(doc.refreshTokenCiphertext).toBe('enc:v2:refresh:8badf00d');
      expect(doc.lastRefreshedAt).toEqual(rotatedAt);
    });

    test('should allow invalidating a session without breaking validation', async () => {
      const doc = new AuthSessionModel(authSession);
      const revokedAt = new Date('2026-04-04T16:30:00.000Z');

      doc.set({
        revokedAt,
        expiresAt: revokedAt,
      });

      await expect(doc.validate()).resolves.toBeUndefined();
      expect(doc.revokedAt).toEqual(revokedAt);
      expect(doc.expiresAt).toEqual(revokedAt);
    });
  });

  describe('AuthSession indexes', () => {
    test('should define the unique sessionId index', () => {
      const indexes = AuthSessionModel.schema.indexes();
      const sessionIdIndex = indexes.find(([fields]) => fields.sessionId === 1);

      expect(sessionIdIndex?.[1]).toMatchObject({ unique: true });
    });

    test('should define indexes for userId, expiresAt, and revokedAt', () => {
      const indexes = AuthSessionModel.schema.indexes();
      const userIdIndex = indexes.find(([fields]) => fields.userId === 1);
      const expiresAtIndex = indexes.find(([fields]) => fields.expiresAt === 1);
      const revokedAtIndex = indexes.find(([fields]) => fields.revokedAt === 1);

      expect(userIdIndex).toBeDefined();
      expect(expiresAtIndex?.[1]).toMatchObject({ expireAfterSeconds: 0 });
      expect(revokedAtIndex).toBeDefined();
    });
  });
});
