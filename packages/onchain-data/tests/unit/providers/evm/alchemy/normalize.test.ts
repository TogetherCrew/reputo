import { describe, expect, it } from 'vitest';
import { normalizeAlchemyTransfer } from '../../../../../src/providers/evm/alchemy/normalize.js';
import type { AlchemyTransfer } from '../../../../../src/providers/evm/alchemy/types.js';

function createAlchemyTransfer(overrides?: Partial<AlchemyTransfer>): AlchemyTransfer {
  return {
    blockNum: '0x112a880',
    uniqueId: '0xtxhash123:log:5',
    hash: '0xtxhash123',
    from: '0xsender',
    to: '0xreceiver',
    value: 1.5,
    erc721TokenId: null,
    erc1155Metadata: null,
    tokenId: null,
    asset: 'FET',
    category: 'erc20',
    rawContract: {
      value: '0xde0b6b3a7640000',
      address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
      decimal: '0x12',
    },
    metadata: {
      blockTimestamp: '2024-01-15T12:00:00.000Z',
    },
    ...overrides,
  };
}

describe('Alchemy Normalize', () => {
  describe('normalizeAlchemyTransfer', () => {
    it('should map all fields to the canonical TransferEvent format', () => {
      const transfer = createAlchemyTransfer();
      const result = normalizeAlchemyTransfer(transfer, '1');

      expect(result.chain_id).toBe('1');
      expect(result.block_number).toBe(18_000_000);
      expect(result.block_hash).toBe('');
      expect(result.block_timestamp).toBe('2024-01-15T12:00:00.000Z');
      expect(result.transaction_hash).toBe('0xtxhash123');
      expect(result.log_index).toBe(5);
      expect(result.from_address).toBe('0xsender');
      expect(result.to_address).toBe('0xreceiver');
      expect(result.token_address).toBe('0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85');
      expect(result.asset_category).toBe('erc20');
    });

    it('should convert hex value to decimal string', () => {
      const transfer = createAlchemyTransfer({
        rawContract: { value: '0xde0b6b3a7640000', address: '0xtoken', decimal: '0x12' },
      });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.value).toBe('1000000000000000000');
    });

    it('should handle null rawContract.value as "0"', () => {
      const transfer = createAlchemyTransfer({
        rawContract: { value: null, address: '0xtoken', decimal: '0x12' },
      });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.value).toBe('0');
    });

    it('should handle zero hex value', () => {
      const transfer = createAlchemyTransfer({
        rawContract: { value: '0x0', address: '0xtoken', decimal: '0x12' },
      });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.value).toBe('0');
    });

    it('should parse log index from uniqueId with :log: format', () => {
      const transfer = createAlchemyTransfer({ uniqueId: '0xabc123:log:42' });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.log_index).toBe(42);
    });

    it('should parse log index from uniqueId with dash format', () => {
      const transfer = createAlchemyTransfer({ uniqueId: '0xabc123-erc20-7' });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.log_index).toBe(7);
    });

    it('should default log index to 0 for unparsable uniqueId', () => {
      const transfer = createAlchemyTransfer({ uniqueId: 'unknown-format' });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.log_index).toBe(0);
    });

    it('should preserve the full Alchemy payload in _alchemy_raw', () => {
      const transfer = createAlchemyTransfer();
      const result = normalizeAlchemyTransfer(transfer, '1');

      expect(result._alchemy_raw).toEqual(transfer);
    });

    it('should handle null to address', () => {
      const transfer = createAlchemyTransfer({ to: null as unknown as string });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.to_address).toBe('');
    });

    it('should handle null rawContract.address', () => {
      const transfer = createAlchemyTransfer({
        rawContract: { value: '0x1', address: null, decimal: null },
      });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.token_address).toBe('');
    });

    it('should handle null category as null asset_category', () => {
      const transfer = createAlchemyTransfer({ category: null as unknown as string });

      const result = normalizeAlchemyTransfer(transfer, '1');
      expect(result.asset_category).toBeNull();
    });
  });
});
