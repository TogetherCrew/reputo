export const MODEL_NAMES = {
  SNAPSHOT: 'Snapshot',
  ALGORITHM_PRESET: 'AlgorithmPreset',
  DEEP_ID_USER: 'DeepIdUser',
  AUTH_SESSION: 'AuthSession',
  DEEP_ID_GRANT: 'DeepIdGrant',
} as const;

export type ModelName = (typeof MODEL_NAMES)[keyof typeof MODEL_NAMES];
