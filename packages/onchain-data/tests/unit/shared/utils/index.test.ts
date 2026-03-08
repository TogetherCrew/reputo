import { describe, expect, it } from 'vitest';
import { chunkArray, DEFAULT_CHUNK_SIZE } from '../../../../src/shared/utils/index.js';

describe('Shared Utils', () => {
  describe('chunkArray', () => {
    it('should split array into chunks of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = chunkArray(array, 3);

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    it('should handle empty array', () => {
      const chunks = chunkArray([], 5);
      expect(chunks).toEqual([]);
    });

    it('should handle array smaller than chunk size', () => {
      const array = [1, 2];
      const chunks = chunkArray(array, 5);
      expect(chunks).toEqual([[1, 2]]);
    });

    it('should handle exact chunk size', () => {
      const array = [1, 2, 3, 4, 5];
      const chunks = chunkArray(array, 5);
      expect(chunks).toEqual([[1, 2, 3, 4, 5]]);
    });

    it('should handle single element array', () => {
      const chunks = chunkArray([1], 3);
      expect(chunks).toEqual([[1]]);
    });

    it('should handle chunk size of 1', () => {
      const array = [1, 2, 3];
      const chunks = chunkArray(array, 1);
      expect(chunks).toEqual([[1], [2], [3]]);
    });

    it('should preserve array element types', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const chunks = chunkArray(array, 2);
      expect(chunks).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    });

    it('should handle objects in array', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const chunks = chunkArray(array, 2);
      expect(chunks).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]]);
    });
  });

  describe('DEFAULT_CHUNK_SIZE', () => {
    it('should be defined', () => {
      expect(DEFAULT_CHUNK_SIZE).toBeDefined();
      expect(typeof DEFAULT_CHUNK_SIZE).toBe('number');
    });

    it('should be a positive number', () => {
      expect(DEFAULT_CHUNK_SIZE).toBeGreaterThan(0);
    });
  });
});
