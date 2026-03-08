import { describe, expect, it } from 'vitest';
import { endpoints } from '../../../src/api/endpoints.js';

describe('API Endpoints', () => {
  describe('endpoints', () => {
    it('should be an empty object (no resources registered yet)', () => {
      expect(endpoints).toBeDefined();
      expect(Object.keys(endpoints)).toHaveLength(0);
    });
  });
});
