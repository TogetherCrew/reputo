import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { create, createMany, findAll, findById } from '../../../../src/resources/pools/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockPool } from '../../../utils/mock-helpers.js';

describe('Pool Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single pool', () => {
      const pool = createMockPool({
        id: 1,
        name: 'Test Pool',
      });

      create(pool);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Pool');
    });
  });

  describe('createMany', () => {
    it('should insert multiple pools', () => {
      const pools = [createMockPool({ id: 1 }), createMockPool({ id: 2 }), createMockPool({ id: 3 })];

      createMany(pools);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all pools', () => {
      create(createMockPool({ id: 1 }));
      create(createMockPool({ id: 2 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find pool by ID', () => {
      const pool = createMockPool({
        id: 1,
        name: 'Specific Pool',
      });
      create(pool);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Specific Pool');
    });
  });
});
