import { describe, expect, it, vi } from 'vitest';
import type { AlchemyClient } from '../../../../../src/providers/evm/alchemy/client.js';
import { fromHex, getFinalizedBlockNumber, toHex } from '../../../../../src/providers/evm/alchemy/finality.js';

describe('Finality', () => {
  describe('toHex', () => {
    it('should convert 0 to 0x0', () => {
      expect(toHex(0)).toBe('0x0');
    });

    it('should convert 1000 to 0x3e8', () => {
      expect(toHex(1000)).toBe('0x3e8');
    });

    it('should convert a large block number', () => {
      expect(toHex(18_000_000)).toBe('0x112a880');
    });
  });

  describe('fromHex', () => {
    it('should parse 0x0 to 0', () => {
      expect(fromHex('0x0')).toBe(0);
    });

    it('should parse 0x3e8 to 1000', () => {
      expect(fromHex('0x3e8')).toBe(1000);
    });

    it('should parse 0x112a880 to 18000000', () => {
      expect(fromHex('0x112a880')).toBe(18_000_000);
    });
  });

  describe('getFinalizedBlockNumber', () => {
    it('should call eth_getBlockByNumber with the finalized tag', async () => {
      const mockClient: AlchemyClient = {
        jsonRpc: vi.fn().mockResolvedValue({ number: '0x112a880', hash: '0xabc', timestamp: '0x0' }),
      };

      const blockNumber = await getFinalizedBlockNumber(mockClient, 'ethereum');

      expect(mockClient.jsonRpc).toHaveBeenCalledWith('ethereum', 'eth_getBlockByNumber', ['finalized', false]);
      expect(blockNumber).toBe(18_000_000);
    });
  });
});
