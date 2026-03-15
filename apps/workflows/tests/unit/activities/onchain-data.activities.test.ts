import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSync = vi.fn();
const mockClose = vi.fn();

vi.mock('@reputo/onchain-data', () => ({
  createSyncAssetTransfersService: vi.fn(async () => ({
    sync: mockSync,
    close: mockClose,
  })),
  ONCHAIN_ASSET_KEYS: ['fet_ethereum', 'fet_cardano', 'fet_cosmos'],
}));

const mockHeartbeat = vi.fn();

vi.mock('@temporalio/activity', () => ({
  Context: {
    current: () => ({
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
      },
      heartbeat: mockHeartbeat,
    }),
  },
}));

import { createSyncAssetTransfersService } from '@reputo/onchain-data';
import { createOnchainDataSyncActivity } from '../../../src/activities/orchestrator/onchain-data.activities.js';

describe('Onchain Data Sync Activity', () => {
  const ctx = {
    dbPath: '/tmp/test-onchain-data.db',
    alchemyApiKey: 'test-alchemy-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync all asset keys', async () => {
    mockSync.mockResolvedValue({
      assetKey: 'fet_ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 150,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(createSyncAssetTransfersService).toHaveBeenCalledWith({
      assetKey: 'fet_ethereum',
      dbPath: '/tmp/test-onchain-data.db',
      alchemyApiKey: 'test-alchemy-key',
    });
    expect(mockSync).toHaveBeenCalledTimes(3);
    expect(mockClose).toHaveBeenCalledTimes(3);
  });

  it('should heartbeat after each asset sync', async () => {
    mockSync.mockResolvedValue({
      assetKey: 'fet_ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 0,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(mockHeartbeat).toHaveBeenCalledWith('fet_ethereum');
    expect(mockHeartbeat).toHaveBeenCalledWith('fet_cardano');
    expect(mockHeartbeat).toHaveBeenCalledWith('fet_cosmos');
  });

  it('should close the service even when sync throws', async () => {
    mockSync.mockRejectedValue(new Error('Alchemy RPC error'));

    const activity = createOnchainDataSyncActivity(ctx);
    await expect(activity()).rejects.toThrow('Alchemy RPC error');

    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('should work on first run when no database exists yet', async () => {
    mockSync.mockResolvedValue({
      assetKey: 'fet_ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 5000,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(createSyncAssetTransfersService).toHaveBeenCalledWith(
      expect.objectContaining({ dbPath: '/tmp/test-onchain-data.db' }),
    );
    expect(mockSync).toHaveBeenCalledTimes(3);
  });
});
