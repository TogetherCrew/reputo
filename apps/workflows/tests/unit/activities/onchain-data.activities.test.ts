import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSync = vi.fn();
const mockClose = vi.fn();

vi.mock('@reputo/onchain-data', () => ({
  createSyncAssetTransfersService: vi.fn(async () => ({
    sync: mockSync,
    close: mockClose,
  })),
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
    databaseUrl: 'postgresql://postgres:postgres@localhost:5432/reputo_onchain_test',
    alchemyApiKey: 'test-alchemy-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync on-chain data for ethereum asset', async () => {
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
      databaseUrl: 'postgresql://postgres:postgres@localhost:5432/reputo_onchain_test',
      alchemyApiKey: 'test-alchemy-key',
    });
    expect(mockSync).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should heartbeat after sync', async () => {
    mockSync.mockResolvedValue({
      assetKey: 'fet_ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 0,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(mockHeartbeat).toHaveBeenCalledWith('fet_ethereum');
    expect(mockHeartbeat).toHaveBeenCalledTimes(1);
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
      expect.objectContaining({ databaseUrl: 'postgresql://postgres:postgres@localhost:5432/reputo_onchain_test' }),
    );
    expect(mockSync).toHaveBeenCalledTimes(1);
  });
});
