import { BadGatewayException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdOAuthService } from '../../../src/auth/deep-id-oauth.service';

const DISCOVERY_DOCUMENT = {
  issuer: 'https://identity.deep-id.ai',
  authorization_endpoint: 'https://identity.deep-id.ai/oauth2/auth',
  token_endpoint: 'https://identity.deep-id.ai/oauth2/token',
  userinfo_endpoint: 'https://identity.deep-id.ai/userinfo',
};

function discoveryResponse() {
  return new Response(JSON.stringify(DISCOVERY_DOCUMENT), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function tokenResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 300,
      token_type: 'Bearer',
      ...overrides,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

describe('DeepIdOAuthService', () => {
  const configValues: Record<string, unknown> = {
    'auth.mode': 'deep-id',
    'auth.deepIdIssuerUrl': 'https://identity.deep-id.ai',
    'auth.deepIdClientId': 'client-id',
    'auth.deepIdClientSecret': 'client-secret',
    'auth.deepIdRedirectUri': 'http://localhost:3000/api/v1/auth/deep-id/callback',
    'auth.deepIdScopes': ['openid', 'profile', 'email', 'offline_access'],
  };

  const fetchMock = vi.fn();

  let service: DeepIdOAuthService;

  function createService(overrides: Record<string, unknown> = {}) {
    const merged = { ...configValues, ...overrides };
    const configService = {
      get: vi.fn((key: string) => merged[key]),
    } as unknown as ConfigService;

    return new DeepIdOAuthService(configService);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    service = createService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('buildAuthorizationUrl', () => {
    it('builds a PKCE S256 authorization URL with the correct parameters', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse());

      const authFlow = { state: 'random-state', codeVerifier: 'random-verifier' };
      const codeChallenge = 'sha256-challenge-value';

      const url = await service.buildAuthorizationUrl(authFlow, codeChallenge);
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://identity.deep-id.ai');
      expect(parsed.pathname).toBe('/oauth2/auth');
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('client_id')).toBe('client-id');
      expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/v1/auth/deep-id/callback');
      expect(parsed.searchParams.get('scope')).toBe('openid profile email offline_access');
      expect(parsed.searchParams.get('state')).toBe('random-state');
      expect(parsed.searchParams.get('code_challenge')).toBe('sha256-challenge-value');
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('uses HTTP Basic client authentication for the authorization code exchange', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse()).mockResolvedValueOnce(tokenResponse());

      await service.exchangeCodeForTokens('authorization-code', 'pkce-verifier');

      expect(fetchMock).toHaveBeenCalledTimes(2);

      const [, requestInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      const headers = requestInit.headers as Record<string, string>;
      const body = new URLSearchParams(requestInit.body as URLSearchParams);

      expect(headers.Authorization).toBe(`Basic ${Buffer.from('client-id:client-secret', 'utf8').toString('base64')}`);
      expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('code')).toBe('authorization-code');
      expect(body.get('redirect_uri')).toBe('http://localhost:3000/api/v1/auth/deep-id/callback');
      expect(body.get('code_verifier')).toBe('pkce-verifier');
      expect(body.get('client_id')).toBeNull();
      expect(body.get('client_secret')).toBeNull();
    });

    it('throws UnauthorizedException for invalid_grant errors', async () => {
      fetchMock
        .mockResolvedValueOnce(discoveryResponse())
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: 'invalid_grant', error_description: 'The authorization code has expired.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
        );

      await expect(service.exchangeCodeForTokens('expired-code', 'verifier')).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadGatewayException for other token endpoint errors', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse()).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'server_error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(service.exchangeCodeForTokens('code', 'verifier')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when the token response is missing access_token', async () => {
      fetchMock
        .mockResolvedValueOnce(discoveryResponse())
        .mockResolvedValueOnce(tokenResponse({ access_token: '', expires_in: 300 }));

      await expect(service.exchangeCodeForTokens('code', 'verifier')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when the token response is missing expires_in', async () => {
      fetchMock
        .mockResolvedValueOnce(discoveryResponse())
        .mockResolvedValueOnce(tokenResponse({ access_token: 'token', expires_in: 0 }));

      await expect(service.exchangeCodeForTokens('code', 'verifier')).rejects.toThrow(BadGatewayException);
    });
  });

  describe('refreshTokens', () => {
    it('uses HTTP Basic client authentication for refresh token requests', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse()).mockResolvedValueOnce(tokenResponse());

      await service.refreshTokens('refresh-token');

      const [, requestInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      const headers = requestInit.headers as Record<string, string>;
      const body = new URLSearchParams(requestInit.body as URLSearchParams);

      expect(headers.Authorization).toBe(`Basic ${Buffer.from('client-id:client-secret', 'utf8').toString('base64')}`);
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('refresh_token')).toBe('refresh-token');
      expect(body.get('client_id')).toBeNull();
      expect(body.get('client_secret')).toBeNull();
    });

    it('throws UnauthorizedException when the refresh token is rejected as invalid_grant', async () => {
      fetchMock
        .mockResolvedValueOnce(discoveryResponse())
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: 'invalid_grant', error_description: 'Refresh token has been revoked.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
        );

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('fetchUserInfo', () => {
    it('sends a Bearer token and returns the userinfo payload', async () => {
      const userInfo = {
        sub: 'did:deep-id:123',
        email: 'user@example.com',
        username: 'testuser',
      };

      fetchMock.mockResolvedValueOnce(discoveryResponse()).mockResolvedValueOnce(
        new Response(JSON.stringify(userInfo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await service.fetchUserInfo('access-token');

      expect(result).toEqual(userInfo);

      const [url, requestInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(url).toBe('https://identity.deep-id.ai/userinfo');
      expect((requestInit.headers as Record<string, string>).Authorization).toBe('Bearer access-token');
    });

    it('throws BadGatewayException when the userinfo endpoint returns an error', async () => {
      fetchMock
        .mockResolvedValueOnce(discoveryResponse())
        .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

      await expect(service.fetchUserInfo('bad-token')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when the userinfo endpoint returns an empty body', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse()).mockResolvedValueOnce(new Response('', { status: 200 }));

      await expect(service.fetchUserInfo('token')).rejects.toThrow(BadGatewayException);
    });
  });

  describe('getDiscoveryDocument', () => {
    it('caches the discovery document across multiple calls', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse());

      const first = await service.getDiscoveryDocument();
      const second = await service.getDiscoveryDocument();

      expect(first).toEqual(second);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches the /.well-known/openid-configuration endpoint', async () => {
      fetchMock.mockResolvedValueOnce(discoveryResponse());

      await service.getDiscoveryDocument();

      const [url] = fetchMock.mock.calls[0] as [URL, RequestInit];
      expect(url.toString()).toBe('https://identity.deep-id.ai/.well-known/openid-configuration');
    });

    it('uses default endpoint paths when the discovery document omits them', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ issuer: 'https://identity.deep-id.ai' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const doc = await service.getDiscoveryDocument();

      expect(doc.authorization_endpoint).toBe('https://identity.deep-id.ai/oauth2/auth');
      expect(doc.token_endpoint).toBe('https://identity.deep-id.ai/oauth2/token');
      expect(doc.userinfo_endpoint).toBe('https://identity.deep-id.ai/userinfo');
    });

    it('throws BadGatewayException when the discovery endpoint is unreachable', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));

      await expect(service.getDiscoveryDocument()).rejects.toThrow(BadGatewayException);
    });

    it('rejects a discovery document whose issuer does not match configuration', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            issuer: 'https://evil.example.com',
            authorization_endpoint: 'https://evil.example.com/oauth2/auth',
            token_endpoint: 'https://evil.example.com/oauth2/token',
            userinfo_endpoint: 'https://evil.example.com/userinfo',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

      await expect(service.getDiscoveryDocument()).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('mock mode', () => {
    it('throws BadGatewayException when calling buildAuthorizationUrl in mock mode', async () => {
      service = createService({ 'auth.mode': 'mock' });

      await expect(service.buildAuthorizationUrl({ state: 's', codeVerifier: 'v' }, 'challenge')).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('throws BadGatewayException when calling exchangeCodeForTokens in mock mode', async () => {
      service = createService({ 'auth.mode': 'mock' });

      await expect(service.exchangeCodeForTokens('code', 'verifier')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when calling refreshTokens in mock mode', async () => {
      service = createService({ 'auth.mode': 'mock' });

      await expect(service.refreshTokens('token')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when calling fetchUserInfo in mock mode', async () => {
      service = createService({ 'auth.mode': 'mock' });

      await expect(service.fetchUserInfo('token')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when calling getDiscoveryDocument in mock mode', async () => {
      service = createService({ 'auth.mode': 'mock' });

      await expect(service.getDiscoveryDocument()).rejects.toThrow(BadGatewayException);
    });
  });
});
