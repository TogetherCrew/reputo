import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPoolsRepo } from '../../../../src/resources/pools/repository.js';
import type { DeepFundingPortalDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockPool } from '../../../utils/mock-helpers.js';

describe('Pool Repository', () => {
  let db: DeepFundingPortalDb;
  let repo: ReturnType<typeof createPoolsRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createPoolsRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single pool', () => {
      const pool = createMockPool({
        id: 1,
        name: 'Test Pool',
      });

      repo.create(pool);

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Pool');
    });
  });

  describe('createMany', () => {
    it('should insert multiple pools', () => {
      const pools = [createMockPool({ id: 1 }), createMockPool({ id: 2 }), createMockPool({ id: 3 })];

      repo.createMany(pools);

      const all = repo.findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all pools', () => {
      repo.create(createMockPool({ id: 1 }));
      repo.create(createMockPool({ id: 2 }));

      const result = repo.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find pool by ID', () => {
      const pool = createMockPool({
        id: 1,
        name: 'Specific Pool',
      });
      repo.create(pool);

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Specific Pool');
    });
  });
});
