import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createUsersRepo } from '../../../../src/resources/users/repository.js';
import type { DeepFundingPortalDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockUser } from '../../../utils/mock-helpers.js';

describe('User Repository', () => {
  let db: DeepFundingPortalDb;
  let repo: ReturnType<typeof createUsersRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createUsersRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single user', () => {
      const user = createMockUser({
        id: 1,
        user_name: 'testuser',
      });

      repo.create(user);

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.userName).toBe('testuser');
    });
  });

  describe('createMany', () => {
    it('should insert multiple users', () => {
      const users = [createMockUser({ id: 1 }), createMockUser({ id: 2 }), createMockUser({ id: 3 })];

      repo.createMany(users);

      const all = repo.findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      repo.create(createMockUser({ id: 1 }));
      repo.create(createMockUser({ id: 2 }));

      const result = repo.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find user by ID', () => {
      const user = createMockUser({
        id: 1,
        user_name: 'specificuser',
      });
      repo.create(user);

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.userName).toBe('specificuser');
    });

    it('should return undefined when user not found', () => {
      const result = repo.findById(999);
      expect(result).toBeUndefined();
    });
  });
});
