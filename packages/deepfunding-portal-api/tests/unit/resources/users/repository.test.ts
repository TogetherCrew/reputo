import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { create, createMany, findAll, findById } from '../../../../src/resources/users/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockUser } from '../../../utils/mock-helpers.js';

describe('User Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single user', () => {
      const user = createMockUser({
        id: 1,
        user_name: 'testuser',
      });

      create(user);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.userName).toBe('testuser');
    });
  });

  describe('createMany', () => {
    it('should insert multiple users', () => {
      const users = [createMockUser({ id: 1 }), createMockUser({ id: 2 }), createMockUser({ id: 3 })];

      createMany(users);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      create(createMockUser({ id: 1 }));
      create(createMockUser({ id: 2 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find user by ID', () => {
      const user = createMockUser({
        id: 1,
        user_name: 'specificuser',
      });
      create(user);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.userName).toBe('specificuser');
    });

    it('should return undefined when user not found', () => {
      const result = findById(999);
      expect(result).toBeUndefined();
    });
  });
});
