import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdAuthService } from '../../../src/auth/deep-id-auth.service';
import { encryptValue } from '../../../src/auth/utils';

describe('DeepIdAuthService', () => {
  const configValues = {
    'auth.tokenEncryptionKey': '0123456789abcdef0123456789abcdef',
    'auth.sessionTtlSeconds': 3600,
    'auth.refreshLeewaySeconds': 60,
    'auth.appPublicUrl': 'http://localhost:5173',
    'auth.deepIdScopes': ['openid', 'profile', 'email', 'offline_access'],
  } as const;

  const oauthService = {
    buildAuthorizationUrl: vi.fn(),
    exchangeCodeForTokens: vi.fn(),
    refreshTokens: vi.fn(),
    fetchUserInfo: vi.fn(),
  };

  const tokenValidationService = {
    validateIdToken: vi.fn(),
  };

  const cookieService = {
    getSessionId: vi.fn(),
    setSessionCookie: vi.fn(),
    clearSessionCookie: vi.fn(),
    setAuthFlowCookie: vi.fn(),
    getAuthFlow: vi.fn(),
    clearAuthFlowCookie: vi.fn(),
  };

  const authSessionRepository = {
    create: vi.fn(),
    findActiveBySessionId: vi.fn(),
    updateAfterRefresh: vi.fn(),
    revokeBySessionId: vi.fn(),
  };

  const deepIdUserRepository = {
    upsertByDid: vi.fn(),
    findById: vi.fn(),
  };

  let service: DeepIdAuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    const configService = {
      get: vi.fn((key: keyof typeof configValues) => configValues[key]),
    } as unknown as ConfigService;

    service = new DeepIdAuthService(
      oauthService as never,
      tokenValidationService as never,
      cookieService as never,
      authSessionRepository as never,
      deepIdUserRepository as never,
      configService,
    );
  });

  it('creates auth flow state and delegates the Deep ID login redirect', async () => {
    const response = {} as any;

    oauthService.buildAuthorizationUrl.mockResolvedValue('https://identity.deep-id.ai/oauth2/auth?state=abc');

    const redirectUrl = await service.getLoginRedirectUrl(response);

    expect(redirectUrl).toBe('https://identity.deep-id.ai/oauth2/auth?state=abc');
    expect(oauthService.buildAuthorizationUrl).toHaveBeenCalledTimes(1);
    expect(cookieService.setAuthFlowCookie).toHaveBeenCalledTimes(1);
    expect(cookieService.setAuthFlowCookie).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        state: expect.any(String),
        nonce: expect.any(String),
        codeVerifier: expect.any(String),
      }),
    );
  });

  it('handles the callback, syncs the user, creates the session, and issues the cookie', async () => {
    const response = {} as any;
    const request = { headers: {} } as any;
    const userId = new Types.ObjectId();

    cookieService.getAuthFlow.mockReturnValue({
      state: 'state-123',
      nonce: 'nonce-123',
      codeVerifier: 'verifier-123',
    });
    oauthService.exchangeCodeForTokens.mockResolvedValue({
      access_token: 'provider-access-token',
      refresh_token: 'provider-refresh-token',
      id_token: 'provider-id-token',
      expires_in: 300,
      refresh_token_expires_in: 1800,
      scope: 'openid profile email offline_access',
      token_type: 'Bearer',
    });
    tokenValidationService.validateIdToken.mockResolvedValue({
      sub: 'did:deep-id:123',
      amr: ['pwd'],
    });
    oauthService.fetchUserInfo.mockResolvedValue({
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      email_verified: true,
      wallet_addresses: ['0xabc'],
      kyc_verified: true,
      amr: ['pwd'],
    });
    deepIdUserRepository.upsertByDid.mockResolvedValue({
      _id: userId,
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      emailVerified: true,
      walletAddresses: ['0xabc'],
      kycVerified: true,
      amr: ['pwd'],
    });
    authSessionRepository.create.mockImplementation(async (payload) => ({
      _id: new Types.ObjectId(),
      ...payload,
    }));

    const redirectUrl = await service.handleCallback(
      {
        code: 'code-123',
        state: 'state-123',
      },
      request,
      response,
    );

    expect(redirectUrl).toBe('http://localhost:5173');
    expect(deepIdUserRepository.upsertByDid).toHaveBeenCalledWith(
      'deep-id',
      'did:deep-id:123',
      expect.objectContaining({
        email: 'jane@example.com',
        emailVerified: true,
        walletAddresses: ['0xabc'],
      }),
    );
    expect(authSessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'deep-id',
        userId,
        accessTokenCiphertext: expect.any(String),
        refreshTokenCiphertext: expect.any(String),
        scope: ['openid', 'profile', 'email', 'offline_access'],
        state: 'state-123',
        nonce: 'nonce-123',
        codeVerifier: 'verifier-123',
      }),
    );
    expect(authSessionRepository.create.mock.calls[0][0].accessTokenCiphertext).not.toBe('provider-access-token');
    expect(authSessionRepository.create.mock.calls[0][0].refreshTokenCiphertext).not.toBe('provider-refresh-token');
    expect(cookieService.setSessionCookie).toHaveBeenCalledTimes(1);
    expect(cookieService.clearAuthFlowCookie).toHaveBeenCalledWith(response);
  });

  it('rejects the callback when the state is mismatched and clears the transient flow cookie', async () => {
    const response = {} as any;
    const request = { headers: {} } as any;

    cookieService.getAuthFlow.mockReturnValue({
      state: 'expected-state',
      nonce: 'nonce-123',
      codeVerifier: 'verifier-123',
    });

    await expect(
      service.handleCallback(
        {
          code: 'code-123',
          state: 'wrong-state',
        },
        request,
        response,
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(authSessionRepository.create).not.toHaveBeenCalled();
    expect(cookieService.clearAuthFlowCookie).toHaveBeenCalledWith(response);
  });

  it('returns unauthenticated and clears the cookie when the opaque session is missing', async () => {
    const response = {} as any;
    const request = { headers: {} } as any;

    cookieService.getSessionId.mockReturnValue('missing-session');
    authSessionRepository.findActiveBySessionId.mockResolvedValue(null);

    await expect(service.getCurrentSession(request, response)).resolves.toEqual({ authenticated: false });
    expect(cookieService.clearSessionCookie).toHaveBeenCalledWith(response);
  });

  it('refreshes near-expiry provider tokens during session bootstrap', async () => {
    const response = {} as any;
    const request = { headers: {} } as any;
    const userId = new Types.ObjectId();
    const encryptedRefreshToken = encryptValue(configValues['auth.tokenEncryptionKey'], 'provider-refresh-token');

    cookieService.getSessionId.mockReturnValue('session-123');
    authSessionRepository.findActiveBySessionId.mockResolvedValue({
      _id: new Types.ObjectId(),
      sessionId: 'session-123',
      provider: 'deep-id',
      userId,
      accessTokenCiphertext: encryptValue(configValues['auth.tokenEncryptionKey'], 'old-access-token'),
      refreshTokenCiphertext: encryptedRefreshToken,
      accessTokenExpiresAt: new Date(Date.now() - 1_000),
      refreshTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1_000),
      scope: ['openid', 'profile'],
      nonce: 'nonce-123',
      state: 'state-123',
      codeVerifier: 'verifier-123',
      expiresAt: new Date(Date.now() + 30 * 60 * 1_000),
    });
    oauthService.refreshTokens.mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 300,
      refresh_token_expires_in: 600,
      scope: 'openid profile email offline_access',
      token_type: 'Bearer',
    });
    authSessionRepository.updateAfterRefresh.mockImplementation(async (_sessionId, payload) => ({
      _id: new Types.ObjectId(),
      sessionId: 'session-123',
      provider: 'deep-id',
      userId,
      nonce: 'nonce-123',
      state: 'state-123',
      codeVerifier: 'verifier-123',
      ...payload,
    }));
    oauthService.fetchUserInfo.mockResolvedValue({
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      email_verified: true,
      wallet_addresses: ['0xabc'],
      kyc_verified: true,
      amr: ['pwd'],
    });
    deepIdUserRepository.upsertByDid.mockResolvedValue({
      _id: userId,
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      emailVerified: true,
      walletAddresses: ['0xabc'],
      kycVerified: true,
      amr: ['pwd'],
    });
    deepIdUserRepository.findById.mockResolvedValue({
      _id: userId,
      did: 'did:deep-id:123',
      email: 'jane@example.com',
      emailVerified: true,
      walletAddresses: ['0xabc'],
      kycVerified: true,
      amr: ['pwd'],
    });

    const currentSession = await service.getCurrentSession(request, response);

    expect(oauthService.refreshTokens).toHaveBeenCalledWith('provider-refresh-token');
    expect(authSessionRepository.updateAfterRefresh).toHaveBeenCalledTimes(1);
    expect(currentSession).toMatchObject({
      authenticated: true,
      provider: 'deep-id',
      user: {
        did: 'did:deep-id:123',
        email: 'jane@example.com',
      },
    });
  });

  it('revokes the current session and clears cookies during logout', async () => {
    const response = {} as any;
    const request = { headers: {} } as any;

    cookieService.getSessionId.mockReturnValue('session-123');

    await service.logout(request, response);

    expect(authSessionRepository.revokeBySessionId).toHaveBeenCalledWith('session-123');
    expect(cookieService.clearSessionCookie).toHaveBeenCalledWith(response);
    expect(cookieService.clearAuthFlowCookie).toHaveBeenCalledWith(response);
  });
});
