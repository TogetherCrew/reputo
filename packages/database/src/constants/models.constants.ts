export const MODEL_NAMES = {
  SNAPSHOT: 'Snapshot',
  ALGORITHM_PRESET: 'AlgorithmPreset',
} as const;

export type ModelName = (typeof MODEL_NAMES)[keyof typeof MODEL_NAMES];
