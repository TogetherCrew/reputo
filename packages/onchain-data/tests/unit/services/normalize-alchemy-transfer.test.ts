import { describe, expect, it } from 'vitest';
import { normalizeAlchemyEthereumTransfer } from '../../../src/providers/ethereum/normalize-alchemy-transfer.js';
import type { AssetKey } from '../../../src/shared/index.js';
import { createMockAlchemyTransfer } from '../../utils/mock-helpers.js';

const assetKey: AssetKey = 'fet_ethereum';

describe('normalizeAlchemyEthereumTransfer', () => {
  it('maps Alchemy transfer to AssetTransferEntity (schema shape)', () => {
    const alchemyTransfer = createMockAlchemyTransfer();
    const result = normalizeAlchemyEthereumTransfer({
      assetKey,
      transfer: alchemyTransfer,
    });

    expect(result.asset_key).toBe(assetKey);
    expect(result.block_number).toBe(0x6e4d3c);
    expect(result.transaction_hash).toBe(alchemyTransfer.hash);
    expect(result.log_index).toBe(0);
    expect(result.from_address).toBe(alchemyTransfer.from.toLowerCase());
    expect(result.to_address).toBe(alchemyTransfer.to?.toLowerCase() ?? null);
    expect(result.amount).toBe('100');
    expect(result.block_timestamp_unix).toBe(
      Math.floor(new Date(alchemyTransfer.metadata!.blockTimestamp!).getTime() / 1000),
    );
  });

  it('parses log index from uniqueId', () => {
    const result = normalizeAlchemyEthereumTransfer({
      assetKey,
      transfer: createMockAlchemyTransfer({ uniqueId: '0xhash:log:0x5' }),
    });
    expect(result.log_index).toBe(5);
  });

  it('handles hex log index in uniqueId', () => {
    const result = normalizeAlchemyEthereumTransfer({
      assetKey,
      transfer: createMockAlchemyTransfer({ uniqueId: '0xhash:log:0xa' }),
    });
    expect(result.log_index).toBe(10);
  });

  it('handles null to address', () => {
    const result = normalizeAlchemyEthereumTransfer({
      assetKey,
      transfer: createMockAlchemyTransfer({ to: null as unknown as string }),
    });
    expect(result.to_address).toBeNull();
  });

  it('handles null value as zero amount', () => {
    const result = normalizeAlchemyEthereumTransfer({
      assetKey,
      transfer: createMockAlchemyTransfer({ value: null }),
    });
    expect(result.amount).toBe('0');
  });
});
