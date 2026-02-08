import { describe, expect, it } from 'vitest';
import { fetchRounds } from '../../../../src/resources/rounds/api.js';
import { createMockClient } from '../../../utils/api-helpers.js';
import { createMockRound } from '../../../utils/mock-helpers.js';

describe('Round API', () => {
  describe('fetchRounds', () => {
    it('should fetch all rounds', async () => {
      const round1 = createMockRound({ id: 1 });
      const round2 = createMockRound({ id: 2 });

      const client = createMockClient();
      client.mockGet.mockResolvedValue([round1, round2]);

      const result = await fetchRounds(client);

      expect(result.length).toBe(2);
      expect(client.mockGet).toHaveBeenCalledWith('/rounds');
    });

    it('should return empty array when no rounds', async () => {
      const client = createMockClient();
      client.mockGet.mockResolvedValue([]);

      const result = await fetchRounds(client);

      expect(result).toEqual([]);
    });
  });
});
