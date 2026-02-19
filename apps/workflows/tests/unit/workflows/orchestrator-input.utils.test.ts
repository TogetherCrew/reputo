import { describe, expect, it } from 'vitest';

import { getAlgorithmTaskQueueFromRuntime } from '../../../src/shared/utils/orchestrator-input.utils.js';

describe('getAlgorithmTaskQueueFromRuntime', () => {
  it('returns typescript queue when runtime is typescript', () => {
    expect(
      getAlgorithmTaskQueueFromRuntime('typescript', {
        typescript: 'ts-queue',
      }),
    ).toBe('ts-queue');
  });

  it('returns python queue when runtime is python', () => {
    expect(
      getAlgorithmTaskQueueFromRuntime('python', {
        typescript: 'ts-queue',
        python: 'py-queue',
      }),
    ).toBe('py-queue');
  });

  it('throws when python runtime has no python queue', () => {
    expect(() =>
      getAlgorithmTaskQueueFromRuntime('python', {
        typescript: 'ts-queue',
      }),
    ).toThrow('Python task queue is required for python runtime');
  });

  it('throws for unsupported runtime', () => {
    expect(() =>
      getAlgorithmTaskQueueFromRuntime('go', {
        typescript: 'ts-queue',
      }),
    ).toThrow('Unsupported algorithm runtime: go');
  });
});
