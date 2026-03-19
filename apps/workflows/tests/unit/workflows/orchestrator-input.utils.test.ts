import { describe, expect, it } from 'vitest';

import { algorithmPythonTaskQueue, algorithmTypescriptTaskQueue } from '../../../src/shared/constants/index.js';
import { getAlgorithmTaskQueueFromRuntime } from '../../../src/shared/utils/orchestrator-input.utils.js';

describe('getAlgorithmTaskQueueFromRuntime', () => {
  it('returns typescript queue when runtime is typescript', () => {
    expect(getAlgorithmTaskQueueFromRuntime('typescript')).toBe(algorithmTypescriptTaskQueue);
  });

  it('returns python queue when runtime is python', () => {
    expect(getAlgorithmTaskQueueFromRuntime('python')).toBe(algorithmPythonTaskQueue);
  });

  it('throws for unsupported runtime', () => {
    expect(() => getAlgorithmTaskQueueFromRuntime('go')).toThrow('Unsupported algorithm runtime: go');
  });
});
