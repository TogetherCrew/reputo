import type { Snapshot } from '@reputo/database';
import { beforeAll, describe, expect, it } from 'vitest';
import { UnsupportedAlgorithmError } from '../../../src/shared/errors/index.js';

describe('dispatchAlgorithm activity', () => {
  beforeAll(() => {
    // Ensure workflows config validation doesn't fail during module import.
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'info';
    process.env.TEMPORAL_ADDRESS = 'localhost:7233';
    process.env.TEMPORAL_NAMESPACE = 'default';
    process.env.TEMPORAL_ORCHESTRATOR_TASK_QUEUE = 'orchestrator-worker';
    process.env.TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE = 'algorithm-typescript-worker';
    process.env.TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE = 'algorithm-python-worker';
    process.env.MONGODB_HOST = 'localhost';
    process.env.MONGODB_PORT = '27017';
    process.env.MONGODB_DB_NAME = 'reputo_test';
    process.env.MONGODB_USER = '';
    process.env.MONGODB_PASSWORD = '';
    process.env.DEEPFUNDING_API_BASE_URL = 'https://api.deepfunding.xyz';
    process.env.DEEPFUNDING_API_KEY = '';
  });

  it('throws UnsupportedAlgorithmError for unknown algorithm keys', async () => {
    const { dispatchAlgorithm } = await import('../../../src/activities/typescript/dispatchAlgorithm.activity.js');
    const run = dispatchAlgorithm({} as never);

    const snapshot: Snapshot = {
      status: 'queued',
      algorithmPreset: '507f1f77bcf86cd799439011',
      algorithmPresetFrozen: {
        key: 'does_not_exist',
        version: '1.0.0',
        inputs: [],
      },
    };

    await expect(run(snapshot)).rejects.toBeInstanceOf(UnsupportedAlgorithmError);
  });
});
