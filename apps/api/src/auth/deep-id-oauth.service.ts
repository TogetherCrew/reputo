import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeepIdOAuthClient } from '../shared/deep-id';
import {
  type DeepIdAuthFlowState,
  type DeepIdDiscoveryDocument,
  type DeepIdTokenResponse,
  type DeepIdUserInfo,
} from '../shared/types';

@Injectable()
export class DeepIdOAuthService {
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private readonly deepIdOAuthClient: DeepIdOAuthClient;

  constructor(configService: ConfigService, @Optional() deepIdOAuthClient?: DeepIdOAuthClient) {
    this.redirectUri = configService.get<string>('auth.deepIdRedirectUri') as string;
    this.scopes = configService.get<string[]>('auth.deepIdScopes') as string[];
    this.deepIdOAuthClient = deepIdOAuthClient ?? new DeepIdOAuthClient(configService);
  }

  buildAuthorizationUrl(authFlow: DeepIdAuthFlowState, codeChallenge: string): Promise<string> {
    return this.deepIdOAuthClient.buildAuthorizationUrl({
      redirectUri: this.redirectUri,
      scope: this.scopes,
      state: authFlow.state,
      codeChallenge,
    });
  }

  exchangeCodeForTokens(code: string, codeVerifier: string): Promise<DeepIdTokenResponse> {
    return this.deepIdOAuthClient.exchangeCodeForTokens({
      code,
      codeVerifier,
      redirectUri: this.redirectUri,
    });
  }

  refreshTokens(refreshToken: string): Promise<DeepIdTokenResponse> {
    return this.deepIdOAuthClient.refreshTokens(refreshToken);
  }

  fetchUserInfo(accessToken: string): Promise<DeepIdUserInfo> {
    return this.deepIdOAuthClient.fetchUserInfo(accessToken);
  }

  getDiscoveryDocument(): Promise<DeepIdDiscoveryDocument> {
    return this.deepIdOAuthClient.getDiscoveryDocument();
  }
}
