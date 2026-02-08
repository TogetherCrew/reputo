import { describe, expect, it } from 'vitest';
import { fetchPools } from '../../../../src/resources/pools/api.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockPool } from '../../../utils/mock-helpers.js';

describe('Pool API', () => {
  describe('fetchPools', () => {
    it('should fetch all pools', async () => {
      const pool1 = createMockPool({ id: 1 });
      const pool2 = createMockPool({ id: 2 });

      const client = createMockClient();
      client.mockGet.mockResolvedValue([pool1, pool2]);

      const result = await fetchPools(client);

      expect(result.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/pools');
    });

    it('should return empty array when no pools', async () => {
      const client = createMockClient();
      client.mockGet.mockResolvedValue([]);

      const result = await fetchPools(client);

      expect(result).toEqual([]);
    });
  });
});
