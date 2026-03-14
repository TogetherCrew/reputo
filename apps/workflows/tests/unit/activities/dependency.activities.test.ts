import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeepfundingSync = vi.fn().mockResolvedValue({ outputs: {} });
const mockOnchainDataSync = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../src/activities/orchestrator/deepfunding-portal-api.activities.js', () => ({
  createDeepfundingSyncActivity: vi.fn(() => mockDeepfundingSync),
}));

vi.mock('../../../src/activities/orchestrator/onchain-data.activities.js', () => ({
  createOnchainDataSyncActivity: vi.fn(() => mockOnchainDataSync),
}));

vi.mock('@temporalio/activity', () => ({
  Context: {
    current: () => ({
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
      },
    }),
  },
}));

import type { Storage } from '@reputo/storage';
import { createDependencyResolverActivities } from '../../../src/activities/orchestrator/dependency.activities.js';
import type { DependencyResolverContext } from '../../../src/shared/types/index.js';

describe('Dependency Resolver Activities', () => {
  const ctx: DependencyResolverContext = {
    storage: {} as Storage,
    storageConfig: { bucket: 'test-bucket', maxSizeBytes: 1024 },
    onchainData: {
      dbPath: '/tmp/test-onchain-data.db',
      alchemyApiKey: 'test-alchemy-key',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should dispatch deepfunding-portal-api to deepfunding sync', async () => {
    const activities = createDependencyResolverActivities(ctx);

    await activities.resolveDependency({
      dependencyKey: 'deepfunding-portal-api',
      snapshotId: 'snapshot-1',
    });

    expect(mockDeepfundingSync).toHaveBeenCalledWith({ snapshotId: 'snapshot-1' });
    expect(mockOnchainDataSync).not.toHaveBeenCalled();
  });

  it('should dispatch onchain-data to onchain data sync', async () => {
    const activities = createDependencyResolverActivities(ctx);

    await activities.resolveDependency({
      dependencyKey: 'onchain-data',
      snapshotId: 'snapshot-1',
    });

    expect(mockOnchainDataSync).toHaveBeenCalledOnce();
    expect(mockDeepfundingSync).not.toHaveBeenCalled();
  });
});
