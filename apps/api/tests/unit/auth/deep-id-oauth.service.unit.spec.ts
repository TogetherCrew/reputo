import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdOAuthService } from '../../../src/auth/deep-id-oauth.service';

describe('DeepIdOAuthService', () => {
  const configValues = {
    'auth.deepIdIssuerUrl': 'https://identity.deep-id.ai',
    'auth.deepIdClientId': 'client-id',
    'auth.deepIdClientSecret': 'client-secret',
    'auth.deepIdRedirectUri': 'http://localhost:3000/api/v1/auth/deep-id/callback',
    'auth.deepIdScopes': ['openid', 'profile', 'email', 'offline_access'],
  } as const;

  const fetchMock = vi.fn();

  let service: DeepIdOAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);

    const configService = {
      get: vi.fn((key: keyof typeof configValues) => configValues[key]),
    } as unknown as ConfigService;

    service = new DeepIdOAuthService(configService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses HTTP Basic client authentication for the authorization code exchange', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            issuer: 'https://identity.deep-id.ai',
            authorization_endpoint: 'https://identity.deep-id.ai/oauth2/auth',
            token_endpoint: 'https://identity.deep-id.ai/oauth2/token',
            userinfo_endpoint: 'https://identity.deep-id.ai/userinfo',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 300,
            token_type: 'Bearer',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

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

  it('uses HTTP Basic client authentication for refresh token requests', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            issuer: 'https://identity.deep-id.ai',
            authorization_endpoint: 'https://identity.deep-id.ai/oauth2/auth',
            token_endpoint: 'https://identity.deep-id.ai/oauth2/token',
            userinfo_endpoint: 'https://identity.deep-id.ai/userinfo',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'next-access-token',
            refresh_token: 'next-refresh-token',
            expires_in: 300,
            token_type: 'Bearer',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

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
});
