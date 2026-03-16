import type { AssetTransferEntity } from '../../src/db/schema.js';
import type { AlchemyAssetTransfer } from '../../src/providers/ethereum/alchemy-types.js';
import { type AssetTransferSyncState, OnchainAssets } from '../../src/shared/index.js';

const FET_ETHEREUM = OnchainAssets.fet_ethereum;

export function createMockAlchemyTransfer(overrides?: Partial<AlchemyAssetTransfer>): AlchemyAssetTransfer {
  return {
    blockNum: '0x6e4d3c',
    uniqueId: '0xabc123def456789000000000000000000000000000000000000000000000abcd:log:0x0',
    hash: '0xabc123def456789000000000000000000000000000000000000000000000abcd',
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    value: 100,
    asset: 'FET',
    category: 'erc20',
    rawContract: {
      value: '0x56bc75e2d63100000',
      address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
      decimal: '0x12',
    },
    metadata: {
      blockTimestamp: '2024-01-15T10:30:00.000Z',
    },
    ...overrides,
  };
}

const FET_ETHEREUM_KEY = 'fet_ethereum' as const;

/** Entity shape matching AssetTransferSchema (block_number, block_timestamp_unix as numbers). */
export function createMockAssetTransferEntity(overrides?: Partial<AssetTransferEntity>): AssetTransferEntity {
  return {
    asset_key: FET_ETHEREUM_KEY,
    block_number: 0x6ecf26,
    transaction_hash: '0xabc123',
    log_index: 0,
    from_address: '0x1234567890abcdef1234567890abcdef12345678',
    to_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '100',
    block_timestamp_unix: Math.floor(new Date('2024-01-15T10:30:00.000Z').getTime() / 1000),
    ...overrides,
  };
}

export function createMockSyncState(overrides?: Partial<AssetTransferSyncState>): AssetTransferSyncState {
  return {
    chain: FET_ETHEREUM.chain,
    assetIdentifier: FET_ETHEREUM.assetIdentifier,
    lastSyncedBlock: '0x6ecf25',
    updatedAt: '2024-01-15T10:30:00.000Z',
    ...overrides,
  };
}
