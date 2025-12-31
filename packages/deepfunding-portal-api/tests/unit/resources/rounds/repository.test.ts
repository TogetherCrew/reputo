import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { create, createMany, findAll, findById } from '../../../../src/resources/rounds/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockRound } from '../../../utils/mock-helpers.js';

describe('Round Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single round', () => {
      const round = createMockRound({
        id: 1,
        name: 'Test Round',
      });

      create(round);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Round');
    });
  });

  describe('createMany', () => {
    it('should insert multiple rounds', () => {
      const rounds = [createMockRound({ id: 1 }), createMockRound({ id: 2 }), createMockRound({ id: 3 })];

      createMany(rounds);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all rounds', () => {
      create(createMockRound({ id: 1 }));
      create(createMockRound({ id: 2 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find round by ID', () => {
      const round = createMockRound({
        id: 1,
        name: 'Specific Round',
      });
      create(round);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Specific Round');
    });
  });
});
