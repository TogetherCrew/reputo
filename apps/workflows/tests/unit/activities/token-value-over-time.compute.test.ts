import type { AssetKey } from '@reputo/onchain-data';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const FET_ETHEREUM: AssetKey = 'fet_ethereum';

const {
  mockGenerateKey,
  mockStringifyCsvAsync,
  mockLoadTransferPageForWallets,
  mockExtractInputs,
  mockResolveSelectedAssets,
  mockLoadWalletAddressMap,
  mockGetWalletsForSelectedAssets,
  mockGetWalletsForChain,
  mockInitializeWalletLots,
  mockCreateOnchainTransferRepo,
  mockReplayTransfers,
  mockScoreWalletLots,
  mockFormatBenchmarkOutput,
  mockHeartbeat,
  mockRepoClose,
} = vi.hoisted(() => ({
  mockGenerateKey: vi.fn(),
  mockStringifyCsvAsync: vi.fn(),
  mockLoadTransferPageForWallets: vi.fn(),
  mockExtractInputs: vi.fn(),
  mockResolveSelectedAssets: vi.fn(),
  mockLoadWalletAddressMap: vi.fn(),
  mockGetWalletsForSelectedAssets: vi.fn(),
  mockGetWalletsForChain: vi.fn(),
  mockInitializeWalletLots: vi.fn(),
  mockCreateOnchainTransferRepo: vi.fn(),
  mockReplayTransfers: vi.fn(),
  mockScoreWalletLots: vi.fn(),
  mockFormatBenchmarkOutput: vi.fn(),
  mockHeartbeat: vi.fn(),
  mockRepoClose: vi.fn(),
}));

vi.mock('@reputo/storage', () => ({
  generateKey: mockGenerateKey,
}));

vi.mock('@temporalio/activity', () => ({
  Context: {
    current: () => ({
      log: {
        info: vi.fn(),
        warn: vi.fn(),
      },
      heartbeat: mockHeartbeat,
    }),
  },
}));

vi.mock('../../../src/config/index.js', () => ({
  default: {
    storage: {
      bucket: 'test-bucket',
    },
  },
}));

vi.mock('../../../src/shared/utils/index.js', () => ({
  stringifyCsvAsync: mockStringifyCsvAsync,
}));

vi.mock('../../../src/activities/typescript/algorithms/token-value-over-time/utils/index.js', () => ({
  createOnchainTransferRepo: mockCreateOnchainTransferRepo,
  extractInputs: mockExtractInputs,
  resolveSelectedAssets: mockResolveSelectedAssets,
  loadWalletAddressMap: mockLoadWalletAddressMap,
  getWalletsForSelectedAssets: mockGetWalletsForSelectedAssets,
  getWalletsForChain: mockGetWalletsForChain,
  initializeWalletLots: mockInitializeWalletLots,
  loadTransferPageForWallets: mockLoadTransferPageForWallets,
}));

vi.mock('../../../src/activities/typescript/algorithms/token-value-over-time/pipeline/index.js', () => ({
  replayTransfers: mockReplayTransfers,
  scoreWalletLots: mockScoreWalletLots,
}));

vi.mock('../../../src/activities/typescript/algorithms/token-value-over-time/benchmark/index.js', () => ({
  formatBenchmarkOutput: mockFormatBenchmarkOutput,
}));

import { computeTokenValueOverTime } from '../../../src/activities/typescript/algorithms/token-value-over-time/compute.js';

describe('computeTokenValueOverTime pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const walletLots = new Map([['0xwallet1', []]]);
    mockExtractInputs.mockReturnValue({
      maturationThresholdDays: 90,
      selectedAssets: [{ chain: 'ethereum', assetIdentifier: '0xtoken' }],
      walletsKey: 'uploads/wallets.json',
      effectiveDateRange: {
        fromTimestampUnix: undefined,
        toTimestampUnix: Math.floor(new Date('2026-04-01T00:00:00.000Z').getTime() / 1000),
      },
    });
    mockResolveSelectedAssets.mockReturnValue([
      { chain: 'ethereum', assetIdentifier: '0xtoken', assetKey: FET_ETHEREUM },
    ]);
    mockLoadWalletAddressMap.mockResolvedValue({
      wallets: {
        ethereum: ['0xwallet1'],
      },
    });
    mockGetWalletsForSelectedAssets.mockReturnValue(['0xwallet1']);
    mockGetWalletsForChain.mockReturnValue(['0xwallet1']);
    mockInitializeWalletLots.mockReturnValue(walletLots);
    mockCreateOnchainTransferRepo.mockResolvedValue({
      close: mockRepoClose,
    });
    mockLoadTransferPageForWallets
      .mockResolvedValueOnce({
        items: [
          {
            assetKey: FET_ETHEREUM,
            blockNumber: '0x1',
            transactionHash: '0xaaa',
            logIndex: 0,
            fromAddress: '0xother',
            toAddress: '0xwallet1',
            amount: 10,
            blockTimestamp: '2026-01-01T00:00:00.000Z',
          },
        ],
        hasMore: true,
      })
      .mockResolvedValueOnce({
        items: [
          {
            assetKey: FET_ETHEREUM,
            blockNumber: '0x2',
            transactionHash: '0xbbb',
            logIndex: 0,
            fromAddress: '0xwallet1',
            toAddress: '0xother',
            amount: 4,
            blockTimestamp: '2026-01-02T00:00:00.000Z',
          },
        ],
        hasMore: false,
      });
    mockReplayTransfers
      .mockReturnValueOnce({
        processed: 1,
        skippedZeroAmount: 0,
        skippedSelfTransfers: 0,
      })
      .mockReturnValueOnce({
        processed: 1,
        skippedZeroAmount: 0,
        skippedSelfTransfers: 0,
      });
    mockScoreWalletLots.mockReturnValue([{ wallet_address: '0xwallet1', token_value: 1.5, lots: [] }]);
    mockStringifyCsvAsync.mockResolvedValue('wallet_address,token_value\n0xwallet1,1.5');
    mockGenerateKey
      .mockReturnValueOnce('outputs/token-value-over-time.csv')
      .mockReturnValueOnce('outputs/token-value-over-time-details.json');
    mockFormatBenchmarkOutput.mockReturnValue({ ok: true });
    mockRepoClose.mockResolvedValue(undefined);
  });

  it('replays all pages before scoring and uploads final outputs', async () => {
    const storage = { putObject: vi.fn().mockResolvedValue(undefined) };

    const result = await computeTokenValueOverTime(
      {
        _id: 'snapshot-1',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        algorithmPresetFrozen: {
          key: 'token_value_over_time',
          inputs: [],
        },
      } as never,
      storage as never,
    );

    const snapshotUnix = Math.floor(new Date('2026-04-01T00:00:00.000Z').getTime() / 1000);
    expect(mockLoadWalletAddressMap).toHaveBeenCalledWith({
      storage,
      bucket: 'test-bucket',
      key: 'uploads/wallets.json',
    });
    expect(mockGetWalletsForChain).toHaveBeenCalledWith(
      {
        wallets: {
          ethereum: ['0xwallet1'],
        },
      },
      'ethereum',
    );
    expect(mockLoadTransferPageForWallets).toHaveBeenNthCalledWith(1, {
      repo: { close: mockRepoClose },
      assetKey: FET_ETHEREUM,
      walletAddresses: ['0xwallet1'],
      page: 1,
      limit: 500,
      fromTimestampUnix: undefined,
      toTimestampUnix: snapshotUnix,
    });
    expect(mockLoadTransferPageForWallets).toHaveBeenNthCalledWith(2, {
      repo: { close: mockRepoClose },
      assetKey: FET_ETHEREUM,
      walletAddresses: ['0xwallet1'],
      page: 2,
      limit: 500,
      fromTimestampUnix: undefined,
      toTimestampUnix: snapshotUnix,
    });
    expect(mockReplayTransfers).toHaveBeenCalledTimes(2);

    const lastReplayCallOrder = mockReplayTransfers.mock.invocationCallOrder.at(-1) ?? 0;
    const scoreCallOrder = mockScoreWalletLots.mock.invocationCallOrder[0] ?? 0;
    expect(scoreCallOrder).toBeGreaterThan(lastReplayCallOrder);

    expect(mockFormatBenchmarkOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        transferCount: 2,
        replay: {
          processed: 2,
          skippedZeroAmount: 0,
          skippedSelfTransfers: 0,
        },
      }),
    );
    expect(mockHeartbeat).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'load-transfers',
        transferCount: 2,
      }),
    );
    expect(mockHeartbeat).toHaveBeenCalledWith({ phase: 'upload' });

    expect(storage.putObject).toHaveBeenNthCalledWith(1, {
      bucket: 'test-bucket',
      key: 'outputs/token-value-over-time.csv',
      body: 'wallet_address,token_value\n0xwallet1,1.5',
      contentType: 'text/csv',
    });
    expect(storage.putObject).toHaveBeenNthCalledWith(2, {
      bucket: 'test-bucket',
      key: 'outputs/token-value-over-time-details.json',
      body: JSON.stringify({ ok: true }, null, 2),
      contentType: 'application/json',
    });
    expect(result).toEqual({
      outputs: {
        token_value_over_time: 'outputs/token-value-over-time.csv',
        token_value_over_time_details: 'outputs/token-value-over-time-details.json',
      },
    });
    expect(mockRepoClose).toHaveBeenCalledOnce();
  });
});
