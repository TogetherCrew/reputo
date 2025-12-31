import { describe, expect, it } from 'vitest';
import { normalizeRoundToRecord } from '../../../../src/resources/rounds/normalize.js';
import { createMockRound } from '../../../utils/mock-helpers.js';

describe('Round Normalization', () => {
  describe('normalizeRoundToRecord', () => {
    it('should transform API response to DB record format', () => {
      const round = createMockRound({
        id: 1,
        name: 'Test Round',
        slug: 'test-round',
        description: 'Test description',
        pool_id: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      const result = normalizeRoundToRecord(round);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Round');
      expect(result.slug).toBe('test-round');
      expect(result.description).toBe('Test description');
      expect(JSON.parse(result.poolIds)).toEqual([1, 2, 3]);
      expect(result.rawJson).toBe(JSON.stringify(round));
    });

    it('should handle null description', () => {
      const round = createMockRound({
        description: undefined,
      });

      const result = normalizeRoundToRecord(round);
      expect(result.description).toBeNull();
    });

    it('should extract pool IDs from array', () => {
      const round = createMockRound({
        pool_id: [{ id: 10 }, { id: 20 }],
      });

      const result = normalizeRoundToRecord(round);
      expect(JSON.parse(result.poolIds)).toEqual([10, 20]);
    });

    it('should handle empty pool_id array', () => {
      const round = createMockRound({
        pool_id: [],
      });

      const result = normalizeRoundToRecord(round);
      expect(JSON.parse(result.poolIds)).toEqual([]);
    });

    it('should serialize raw JSON correctly', () => {
      const round = createMockRound({
        id: 42,
        name: 'Complex Round',
      });

      const result = normalizeRoundToRecord(round);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.id).toBe(42);
      expect(parsed.name).toBe('Complex Round');
    });
  });
});
