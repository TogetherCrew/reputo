import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSync = vi.fn();
const mockClose = vi.fn();

vi.mock('@reputo/onchain-data', () => ({
  createSyncTokenTransfersService: vi.fn(() => ({
    sync: mockSync,
    close: mockClose,
  })),
  SupportedTokenChain: {
    FET_ETHEREUM: 'fet-ethereum',
  },
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

import { createSyncTokenTransfersService } from '@reputo/onchain-data';
import { createOnchainDataSyncActivity } from '../../../src/activities/orchestrator/onchain-data.activities.js';

describe('Onchain Data Sync Activity', () => {
  const ctx = {
    dbPath: '/tmp/test-onchain-data.db',
    alchemyApiKey: 'test-alchemy-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sync all supported token chains', async () => {
    mockSync.mockResolvedValue({
      tokenChain: 'fet-ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 150,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(createSyncTokenTransfersService).toHaveBeenCalledWith({
      tokenChain: 'fet-ethereum',
      dbPath: '/tmp/test-onchain-data.db',
      alchemyApiKey: 'test-alchemy-key',
    });
    expect(mockSync).toHaveBeenCalledOnce();
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('should heartbeat after each token chain sync', async () => {
    mockSync.mockResolvedValue({
      tokenChain: 'fet-ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 0,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(mockHeartbeat).toHaveBeenCalledWith('fet-ethereum');
  });

  it('should close the service even when sync throws', async () => {
    mockSync.mockRejectedValue(new Error('Alchemy RPC error'));

    const activity = createOnchainDataSyncActivity(ctx);
    await expect(activity()).rejects.toThrow('Alchemy RPC error');

    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('should work on first run when no database exists yet', async () => {
    mockSync.mockResolvedValue({
      tokenChain: 'fet-ethereum',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 5000,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity();

    expect(createSyncTokenTransfersService).toHaveBeenCalledWith(
      expect.objectContaining({ dbPath: '/tmp/test-onchain-data.db' }),
    );
    expect(mockSync).toHaveBeenCalledOnce();
  });
});
