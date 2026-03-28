import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateDb, mockSyncEvmAssetTransfer, mockSyncCardanoAssetTransfer, mockDbDestroy, mockHeartbeat } =
  vi.hoisted(() => ({
    mockCreateDb: vi.fn(),
    mockSyncEvmAssetTransfer: vi.fn(),
    mockSyncCardanoAssetTransfer: vi.fn(),
    mockDbDestroy: vi.fn(),
    mockHeartbeat: vi.fn(),
  }));

vi.mock('@reputo/onchain-data', () => ({
  createDb: mockCreateDb,
  syncEvmAssetTransfer: mockSyncEvmAssetTransfer,
  syncCardanoAssetTransfer: mockSyncCardanoAssetTransfer,
}));

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

import { createOnchainDataSyncActivity } from '../../../src/activities/orchestrator/onchain-data.activities.js';

describe('Onchain Data Sync Activity', () => {
  const ctx = {
    databaseUrl: 'postgresql://postgres:postgres@localhost:5432/reputo_onchain_test',
    alchemyApiKey: 'test-alchemy-key',
    blockfrostAPIKey: 'test-blockfrost-api-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateDb.mockResolvedValue({ destroy: mockDbDestroy });
  });

  it('should sync EVM asset when given ethereum target', async () => {
    mockSyncEvmAssetTransfer.mockResolvedValue({
      chain: 'ethereum',
      assetIdentifier: '0xtoken',
      fromBlock: '0xa7d13c',
      toBlock: '0xb00000',
      insertedCount: 150,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity([{ chain: 'ethereum', identifier: '0xtoken' }]);

    expect(mockSyncEvmAssetTransfer).toHaveBeenCalledWith({
      db: { destroy: mockDbDestroy },
      chain: 'ethereum',
      assetIdentifier: '0xtoken',
      alchemyApiKey: 'test-alchemy-key',
    });
    expect(mockDbDestroy).toHaveBeenCalledOnce();
  });

  it('should sync Cardano asset when given cardano target', async () => {
    mockSyncCardanoAssetTransfer.mockResolvedValue({
      chain: 'cardano',
      assetIdentifier: 'e824c001...',
      pageCount: 5,
      insertedAssetTransactionCount: 100,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity([{ chain: 'cardano', identifier: 'e824c001...' }]);

    expect(mockSyncCardanoAssetTransfer).toHaveBeenCalledWith({
      db: { destroy: mockDbDestroy },
      assetIdentifier: 'e824c001...',
      blockfrostAPIKey: 'test-blockfrost-api-key',
    });
    expect(mockDbDestroy).toHaveBeenCalledOnce();
  });

  it('should heartbeat after each target sync', async () => {
    mockSyncEvmAssetTransfer.mockResolvedValue({
      chain: 'ethereum',
      assetIdentifier: '0xtoken',
      fromBlock: '0x0',
      toBlock: '0x1',
      insertedCount: 0,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity([{ chain: 'ethereum', identifier: '0xtoken' }]);

    expect(mockHeartbeat).toHaveBeenCalledWith({ chain: 'ethereum', identifier: '0xtoken' });
  });

  it('should close the db even when sync throws', async () => {
    mockSyncEvmAssetTransfer.mockRejectedValue(new Error('Alchemy RPC error'));

    const activity = createOnchainDataSyncActivity(ctx);
    await expect(activity([{ chain: 'ethereum', identifier: '0xtoken' }])).rejects.toThrow('Alchemy RPC error');

    expect(mockDbDestroy).toHaveBeenCalledOnce();
  });

  it('should skip sync when no targets provided', async () => {
    const activity = createOnchainDataSyncActivity(ctx);
    await activity([]);

    expect(mockCreateDb).not.toHaveBeenCalled();
    expect(mockSyncEvmAssetTransfer).not.toHaveBeenCalled();
  });

  it('should sync multiple targets sequentially', async () => {
    mockSyncEvmAssetTransfer.mockResolvedValue({
      chain: 'ethereum',
      assetIdentifier: '0xtoken',
      fromBlock: '0x0',
      toBlock: '0x1',
      insertedCount: 50,
    });
    mockSyncCardanoAssetTransfer.mockResolvedValue({
      chain: 'cardano',
      assetIdentifier: 'e824c001...',
      pageCount: 3,
      insertedAssetTransactionCount: 30,
    });

    const activity = createOnchainDataSyncActivity(ctx);
    await activity([
      { chain: 'ethereum', identifier: '0xtoken' },
      { chain: 'cardano', identifier: 'e824c001...' },
    ]);

    expect(mockSyncEvmAssetTransfer).toHaveBeenCalledTimes(1);
    expect(mockSyncCardanoAssetTransfer).toHaveBeenCalledTimes(1);
    expect(mockHeartbeat).toHaveBeenCalledTimes(2);
    expect(mockDbDestroy).toHaveBeenCalledOnce();
  });
});
