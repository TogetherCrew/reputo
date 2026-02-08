import { describe, expect, it } from 'vitest';

import {
  getAlgorithmTaskQueueFromRuntime,
  normalizeOrchestratorWorkflowInput,
} from '../../../src/shared/utils/orchestrator-input.utils.js';

describe('orchestrator-input utils', () => {
  describe('normalizeOrchestratorWorkflowInput', () => {
    it('normalizes legacy string input to OrchestratorWorkflowInput', () => {
      expect(normalizeOrchestratorWorkflowInput('snapshot-123')).toEqual({
        snapshotId: 'snapshot-123',
      });
    });
  });

  describe('getAlgorithmTaskQueueFromRuntime', () => {
    it('returns provided typescript queue when runtime is typescript', () => {
      expect(
        getAlgorithmTaskQueueFromRuntime('typescript', {
          typescript: 'ts-queue',
        }),
      ).toBe('ts-queue');
    });

    it('falls back to default typescript queue if not provided', () => {
      expect(getAlgorithmTaskQueueFromRuntime('typescript', undefined)).toBe('algorithm-typescript-worker');
    });

    it('throws for unsupported runtime', () => {
      expect(() => getAlgorithmTaskQueueFromRuntime('go', undefined)).toThrow('Unsupported algorithm runtime: go');
    });
  });
});
