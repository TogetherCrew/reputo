import { Types } from 'mongoose';
import { describe, expect, test } from 'vitest';
import type { AuthSession, OAuthProviderDeepId as OAuthProviderDeepIdType, OAuthUser } from '../../src/index.js';
import {
  AuthSessionModelValue,
  AuthSessionSchema,
  MODEL_NAMES,
  OAuthProviderDeepId,
  OAuthUserModelValue,
  OAuthUserSchema,
} from '../../src/index.js';
import DirectAuthSessionModel from '../../src/models/AuthSession.model.js';
import DirectOAuthUserModel from '../../src/models/OAuthUser.model.js';
import DirectAuthSessionSchema from '../../src/schemas/AuthSession.schema.js';
import DirectOAuthUserSchema from '../../src/schemas/OAuthUser.schema.js';

describe('@reputo/database public exports', () => {
  test('should export the auth models, schemas, and constants from the root entrypoint', () => {
    expect(OAuthProviderDeepId).toBe('deep-id');
    expect(MODEL_NAMES.OAUTH_USER).toBe('OAuthUser');
    expect(MODEL_NAMES.AUTH_SESSION).toBe('AuthSession');
    expect(OAuthUserModelValue).toBe(DirectOAuthUserModel);
    expect(AuthSessionModelValue).toBe(DirectAuthSessionModel);
    expect(OAuthUserSchema).toBe(DirectOAuthUserSchema);
    expect(AuthSessionSchema).toBe(DirectAuthSessionSchema);
  });

  test('should export the auth types from the root entrypoint', () => {
    const provider: OAuthProviderDeepIdType = OAuthProviderDeepId;
    const user: OAuthUser = {
      provider,
      sub: 'did:plc:pwtlzekayxk67odbhen6v2bb',
      email: 'user@example.com',
      email_verified: true,
      username: 'user',
    };
    const session: AuthSession = {
      sessionId: 'session-456',
      provider,
      userId: new Types.ObjectId(),
      accessTokenCiphertext: 'enc:v1:access:deadbeef',
      refreshTokenCiphertext: 'enc:v1:refresh:cafebabe',
      accessTokenExpiresAt: new Date('2026-04-02T10:00:00.000Z'),
      refreshTokenExpiresAt: new Date('2026-05-02T10:00:00.000Z'),
      scope: ['openid'],
      state: 'state-456',
      codeVerifier: 'code-verifier-456',
      expiresAt: new Date('2026-05-02T10:00:00.000Z'),
    };

    expect(user.provider).toBe(provider);
    expect(session.provider).toBe(provider);
  });
});
