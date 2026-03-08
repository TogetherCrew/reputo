import { describe, expect, it } from 'vitest';
import { normalizeTransferToRecord } from '../../../../src/resources/transfers/normalize.js';
import { createMockTransfer } from '../../../utils/mock-helpers.js';

describe('Transfer Normalization', () => {
  describe('normalizeTransferToRecord', () => {
    it('should transform API response to DB record format', () => {
      const transfer = createMockTransfer({
        chain_id: '1',
        block_number: 18_000_000,
        block_hash: '0xblockhash',
        block_timestamp: '2024-06-15T12:00:00Z',
        transaction_hash: '0xtxhash',
        log_index: 3,
        from_address: '0xsender',
        to_address: '0xreceiver',
        token_address: '0xtoken',
        value: '5000000000000000000',
        asset_category: 'erc20',
      });

      const result = normalizeTransferToRecord(transfer);

      expect(result.chainId).toBe('1');
      expect(result.blockNumber).toBe(18_000_000);
      expect(result.blockHash).toBe('0xblockhash');
      expect(result.blockTimestamp).toBe('2024-06-15T12:00:00Z');
      expect(result.transactionHash).toBe('0xtxhash');
      expect(result.logIndex).toBe(3);
      expect(result.fromAddress).toBe('0xsender');
      expect(result.toAddress).toBe('0xreceiver');
      expect(result.tokenAddress).toBe('0xtoken');
      expect(result.value).toBe('5000000000000000000');
      expect(result.assetCategory).toBe('erc20');
      expect(result.rawJson).toBe(JSON.stringify(transfer));
    });

    it('should handle null asset_category', () => {
      const transfer = createMockTransfer({ asset_category: null });

      const result = normalizeTransferToRecord(transfer);
      expect(result.assetCategory).toBeNull();
    });

    it('should handle undefined asset_category', () => {
      const transfer = createMockTransfer({ asset_category: undefined });

      const result = normalizeTransferToRecord(transfer);
      expect(result.assetCategory).toBeNull();
    });

    it('should preserve extra provider fields in rawJson', () => {
      const transfer = createMockTransfer({
        extra_provider_field: 'some-data',
        nested: { deep: true },
      });

      const result = normalizeTransferToRecord(transfer);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.extra_provider_field).toBe('some-data');
      expect(parsed.nested).toEqual({ deep: true });
    });
  });
});
