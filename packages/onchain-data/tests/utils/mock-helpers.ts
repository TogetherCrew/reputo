import type { SyncCursor } from '../../src/resources/syncCursors/types.js';
import type { TransferEvent } from '../../src/resources/transfers/types.js';

export function createMockTransfer(overrides?: Partial<TransferEvent>): TransferEvent {
  return {
    chain_id: '1',
    block_number: 18_000_000,
    block_hash: '0xabc123',
    block_timestamp: '2024-01-01T00:00:00Z',
    transaction_hash: '0xtx1',
    log_index: 0,
    from_address: '0xfrom',
    to_address: '0xto',
    token_address: '0xtoken',
    value: '1000000000000000000',
    asset_category: 'erc20',
    ...overrides,
  };
}

export function createMockSyncCursor(overrides?: Partial<SyncCursor>): SyncCursor {
  return {
    chainId: '1',
    tokenAddress: '0xtoken',
    cursorBlock: 18_000_000,
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}
