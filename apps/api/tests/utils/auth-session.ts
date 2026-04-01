import { randomUUID } from 'node:crypto';
import { getModelToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import type { AuthSession, DeepIdUser } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { Model } from 'mongoose';
import { encryptValue } from '../../src/shared/utils';

export const AUTH_TEST_ENV = {
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

export interface CreateAuthenticatedSessionOptions {
  accessTokenExpiresAt?: Date;
  email?: string;
  expiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string[];
}

export function applyAuthTestEnv(): void {
  for (const [key, value] of Object.entries(AUTH_TEST_ENV)) {
    process.env[key] = value;
  }
}

export async function createAuthenticatedSession(
  moduleRef: TestingModule,
  options: CreateAuthenticatedSessionOptions = {},
) {
  const authSessionModel = moduleRef.get<Model<AuthSession>>(getModelToken(MODEL_NAMES.AUTH_SESSION));
  const deepIdUserModel = moduleRef.get<Model<DeepIdUser>>(getModelToken(MODEL_NAMES.DEEP_ID_USER));
  const didSuffix = randomUUID();
  const now = Date.now();
  const user = await deepIdUserModel.create({
    provider: 'deep-id',
    did: `did:deep-id:${didSuffix}`,
    email: options.email ?? `${didSuffix}@example.com`,
    emailVerified: true,
    walletAddresses: [],
    kycVerified: false,
    amr: ['pwd'],
  });
  const sessionId = randomUUID();

  await authSessionModel.create({
    sessionId,
    provider: 'deep-id',
    userId: user._id,
    accessTokenCiphertext: encryptValue(AUTH_TEST_ENV.AUTH_TOKEN_ENCRYPTION_KEY, 'provider-access-token'),
    refreshTokenCiphertext: encryptValue(AUTH_TEST_ENV.AUTH_TOKEN_ENCRYPTION_KEY, 'provider-refresh-token'),
    accessTokenExpiresAt: options.accessTokenExpiresAt ?? new Date(now + 10 * 60 * 1000),
    refreshTokenExpiresAt: options.refreshTokenExpiresAt ?? new Date(now + 30 * 60 * 1000),
    scope: options.scope ?? ['openid', 'profile', 'email', 'offline_access'],
    nonce: `nonce-${didSuffix}`,
    state: `state-${didSuffix}`,
    codeVerifier: `verifier-${didSuffix}`,
    expiresAt: options.expiresAt ?? new Date(now + 30 * 60 * 1000),
  });

  return {
    cookie: `${AUTH_TEST_ENV.AUTH_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    sessionId,
    userId: user._id.toString(),
  };
}
