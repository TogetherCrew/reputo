export const MODEL_NAMES = {
  SNAPSHOT: 'Snapshot',
  ALGORITHM_PRESET: 'AlgorithmPreset',
  OAUTH_USER: 'OAuthUser',
  AUTH_SESSION: 'AuthSession',
  OAUTH_CONSENT_GRANT: 'OAuthConsentGrant',
} as const;

export type ModelName = (typeof MODEL_NAMES)[keyof typeof MODEL_NAMES];
