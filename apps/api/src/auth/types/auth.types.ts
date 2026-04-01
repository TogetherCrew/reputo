import type { DeepIdProvider } from '@reputo/database';

export interface JsonWebKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  x5c?: string[];
  [key: string]: unknown;
}

export interface JsonWebKeySet {
  keys?: JsonWebKey[];
}

export interface DeepIdDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  id_token_signing_alg_values_supported?: string[];
}

export interface DeepIdTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  id_token?: string;
  scope?: string;
}

export interface DeepIdUserInfo {
  sub?: string;
  did?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  wallet_addresses?: string[];
  walletAddresses?: string[];
  kyc_verified?: boolean;
  kycVerified?: boolean;
  amr?: string[];
  [key: string]: unknown;
}

export interface DeepIdIdTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat?: number;
  nbf?: number;
  azp?: string;
  nonce?: string;
  amr?: string[];
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
  nonce: string;
  codeVerifier: string;
}

export interface DeepIdSessionUserView {
  id: string;
  did: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  walletAddresses: string[];
  kycVerified: boolean;
  amr: string[];
}

export interface DeepIdCurrentSession {
  authenticated: boolean;
  provider?: DeepIdProvider;
  expiresAt?: string;
  scope?: string[];
  user?: DeepIdSessionUserView;
}
