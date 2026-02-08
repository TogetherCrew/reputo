import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  create,
  createMany,
  findAll,
  findById,
  findByRoundId,
} from '../../../../src/resources/proposals/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockProposal } from '../../../utils/mock-helpers.js';

describe('Proposal Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single proposal', () => {
      const proposal = createMockProposal({
        id: 1,
        round_id: 10,
        title: 'Test Proposal',
      });

      create(proposal);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Proposal');
      expect(result?.roundId).toBe(10);
    });
  });

  describe('createMany', () => {
    it('should insert multiple proposals', () => {
      const proposals = [
        createMockProposal({ id: 1, round_id: 10 }),
        createMockProposal({ id: 2, round_id: 10 }),
        createMockProposal({ id: 3, round_id: 20 }),
      ];

      createMany(proposals);

      const all = findAll();
      expect(all.length).toBe(3);
    });

    it('should handle chunking for large batches', () => {
      const proposals = Array.from({ length: 250 }, (_, i) =>
        createMockProposal({
          id: i + 1,
          round_id: 10,
        }),
      );

      createMany(proposals, { chunkSize: 100 });

      const all = findAll();
      expect(all.length).toBe(250);
    });
  });

  describe('findAll', () => {
    it('should return all proposals', () => {
      create(createMockProposal({ id: 1, round_id: 10 }));
      create(createMockProposal({ id: 2, round_id: 20 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no proposals exist', () => {
      const result = findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByRoundId', () => {
    it('should find proposals by round ID', () => {
      create(createMockProposal({ id: 1, round_id: 10 }));
      create(createMockProposal({ id: 2, round_id: 10 }));
      create(createMockProposal({ id: 3, round_id: 20 }));

      const result = findByRoundId(10);
      expect(result.length).toBe(2);
      expect(result.every((p) => p.roundId === 10)).toBe(true);
    });

    it('should return empty array when no proposals found for round', () => {
      const result = findByRoundId(999);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find proposal by ID', () => {
      const proposal = createMockProposal({
        id: 1,
        round_id: 10,
        title: 'Specific Proposal',
      });
      create(proposal);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Specific Proposal');
    });

    it('should return undefined when proposal not found', () => {
      const result = findById(999);
      expect(result).toBeUndefined();
    });
  });
});
