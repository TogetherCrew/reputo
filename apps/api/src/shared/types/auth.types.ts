import type { DeepIdProvider } from '@reputo/database';

export interface DeepIdDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
}

export interface DeepIdTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

export interface DeepIdUserInfo {
  aud?: string | string[];
  auth_time?: number;
  email?: string;
  email_verified?: boolean;
  iat?: number;
  iss?: string;
  picture?: string;
  rat?: number;
  sub?: string;
  username?: string;
  [key: string]: unknown;
}

export interface DeepIdCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface DeepIdAuthFlowState {
  state: string;
  codeVerifier: string;
}

export interface DeepIdSessionUserView {
  id: string;
  provider: DeepIdProvider;
  sub: string;
  aud?: string[];
  auth_time?: number;
  email?: string;
  email_verified?: boolean;
  iat?: number;
  iss?: string;
  picture?: string;
  rat?: number;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeepIdCurrentSession {
  authenticated: boolean;
  provider?: DeepIdProvider;
  expiresAt?: string;
  scope?: string[];
  user?: DeepIdSessionUserView;
}
