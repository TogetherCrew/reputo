export const DeepIdProvider = 'deep-id' as const;
export type DeepIdProvider = typeof DeepIdProvider;

export const AUTH_PROVIDERS = [DeepIdProvider] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const AUTH_SESSION_PRIVATE_FIELDS = [
  'accessTokenCiphertext',
  'refreshTokenCiphertext',
  'nonce',
  'state',
  'codeVerifier',
] as const;
export type AuthSessionPrivateField = (typeof AUTH_SESSION_PRIVATE_FIELDS)[number];
