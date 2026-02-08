import { describe, expect, it } from 'vitest';
import { normalizePoolToRecord } from '../../../../src/resources/pools/normalize.js';
import { createMockPool } from '../../../utils/mock-helpers.js';

describe('Pool Normalization', () => {
  describe('normalizePoolToRecord', () => {
    it('should transform API response to DB record format', () => {
      const pool = createMockPool({
        id: 1,
        name: 'Test Pool',
        slug: 'test-pool',
        max_funding_amount: 100000,
        description: 'Test description',
      });

      const result = normalizePoolToRecord(pool);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Pool');
      expect(result.slug).toBe('test-pool');
      expect(result.maxFundingAmount).toBe(100000);
      expect(result.description).toBe('Test description');
      expect(result.rawJson).toBe(JSON.stringify(pool));
    });

    it('should handle null description', () => {
      const pool = createMockPool({
        description: undefined,
      });

      const result = normalizePoolToRecord(pool);
      expect(result.description).toBeNull();
    });

    it('should serialize raw JSON correctly', () => {
      const pool = createMockPool({
        id: 42,
        name: 'Complex Pool',
      });

      const result = normalizePoolToRecord(pool);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.id).toBe(42);
      expect(parsed.name).toBe('Complex Pool');
    });
  });
});
