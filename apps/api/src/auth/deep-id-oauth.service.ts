import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_MODE_DEEP_ID,
  AUTH_MODE_MOCK,
  DEEP_ID_DEFAULT_AUTHORIZATION_PATH,
  DEEP_ID_DEFAULT_TOKEN_PATH,
  DEEP_ID_DEFAULT_USERINFO_PATH,
  DEEP_ID_DISCOVERY_PATH,
} from '../shared/constants';
import {
  type DeepIdAuthFlowState,
  type DeepIdDiscoveryDocument,
  type DeepIdTokenResponse,
  type DeepIdUserInfo,
} from '../shared/types';

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/u, '');
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new BadGatewayException('Deep ID returned an empty response.');
  }

  return JSON.parse(text) as T;
}

interface DeepIdTokenErrorResponse {
  error?: string;
  error_description?: string;
}

@Injectable()
export class DeepIdOAuthService {
  private readonly authMode: string;
  private readonly issuerUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private discoveryPromise?: Promise<DeepIdDiscoveryDocument>;

  constructor(configService: ConfigService) {
    this.authMode = (configService.get<string>('auth.mode') ?? AUTH_MODE_DEEP_ID).toLowerCase();
    this.issuerUrl = normalizeUrl(configService.get<string>('auth.deepIdIssuerUrl') as string);
    this.clientId = configService.get<string>('auth.deepIdClientId') as string;
    this.clientSecret = configService.get<string>('auth.deepIdClientSecret') as string;
    this.redirectUri = configService.get<string>('auth.deepIdRedirectUri') as string;
    this.scopes = configService.get<string[]>('auth.deepIdScopes') as string[];
  }

  async buildAuthorizationUrl(authFlow: DeepIdAuthFlowState, codeChallenge: string): Promise<string> {
    this.ensureDeepIdMode();
    const discovery = await this.getDiscoveryDocument();
    const url = new URL(discovery.authorization_endpoint);

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('scope', this.scopes.join(' '));
    url.searchParams.set('state', authFlow.state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return url.toString();
  }

  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<DeepIdTokenResponse> {
    this.ensureDeepIdMode();
    return this.fetchTokenResponse({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });
  }

  async refreshTokens(refreshToken: string): Promise<DeepIdTokenResponse> {
    this.ensureDeepIdMode();
    return this.fetchTokenResponse({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  async fetchUserInfo(accessToken: string): Promise<DeepIdUserInfo> {
    this.ensureDeepIdMode();
    const discovery = await this.getDiscoveryDocument();
    const response = await fetch(discovery.userinfo_endpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadGatewayException('Deep ID userinfo request failed.');
    }

    return parseJsonResponse<DeepIdUserInfo>(response);
  }

  async getDiscoveryDocument(): Promise<DeepIdDiscoveryDocument> {
    this.ensureDeepIdMode();
    if (!this.discoveryPromise) {
      this.discoveryPromise = this.fetchDiscoveryDocument();
    }

    return this.discoveryPromise;
  }

  private ensureDeepIdMode(): void {
    if (this.authMode === AUTH_MODE_MOCK) {
      throw new BadGatewayException('Deep ID OAuth is disabled when AUTH_MODE=mock.');
    }
  }

  private async fetchDiscoveryDocument(): Promise<DeepIdDiscoveryDocument> {
    const discoveryUrl = new URL(DEEP_ID_DISCOVERY_PATH, `${this.issuerUrl}/`);
    const response = await fetch(discoveryUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new BadGatewayException('Deep ID discovery request failed.');
    }

    const discovery = await parseJsonResponse<Partial<DeepIdDiscoveryDocument>>(response);
    const issuer = normalizeUrl(discovery.issuer ?? this.issuerUrl);

    if (issuer !== this.issuerUrl) {
      throw new UnauthorizedException('Deep ID discovery issuer does not match configuration.');
    }

    return {
      issuer,
      authorization_endpoint:
        discovery.authorization_endpoint ?? new URL(DEEP_ID_DEFAULT_AUTHORIZATION_PATH, `${issuer}/`).toString(),
      token_endpoint: discovery.token_endpoint ?? new URL(DEEP_ID_DEFAULT_TOKEN_PATH, `${issuer}/`).toString(),
      userinfo_endpoint: discovery.userinfo_endpoint ?? new URL(DEEP_ID_DEFAULT_USERINFO_PATH, `${issuer}/`).toString(),
    };
  }

  private async fetchTokenResponse(params: Record<string, string>): Promise<DeepIdTokenResponse> {
    const discovery = await this.getDiscoveryDocument();
    const body = new URLSearchParams(params);
    const basicAuthorization = Buffer.from(`${this.clientId}:${this.clientSecret}`, 'utf8').toString('base64');

    const response = await fetch(discovery.token_endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${basicAuthorization}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as DeepIdTokenErrorResponse | null;

      if (errorPayload?.error === 'invalid_grant') {
        throw new UnauthorizedException(errorPayload.error_description ?? 'Deep ID rejected the authorization grant.');
      }

      throw new BadGatewayException(errorPayload?.error_description ?? 'Deep ID token exchange failed.');
    }

    const tokenResponse = await parseJsonResponse<DeepIdTokenResponse>(response);

    if (!tokenResponse.access_token || !tokenResponse.expires_in) {
      throw new BadGatewayException('Deep ID token response is incomplete.');
    }

    return tokenResponse;
  }
}
