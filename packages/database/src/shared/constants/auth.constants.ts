export const OAuthProviderDeepId = 'deep-id' as const;
export type OAuthProviderDeepId = typeof OAuthProviderDeepId;

export const OAUTH_PROVIDERS = [OAuthProviderDeepId] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const AUTH_SESSION_PRIVATE_FIELDS = [
  'accessTokenCiphertext',
  'refreshTokenCiphertext',
  'state',
  'codeVerifier',
] as const;
export type AuthSessionPrivateField = (typeof AUTH_SESSION_PRIVATE_FIELDS)[number];
