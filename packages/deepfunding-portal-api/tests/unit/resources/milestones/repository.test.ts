import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  create,
  createMany,
  findAll,
  findById,
  findByProposalId,
} from '../../../../src/resources/milestones/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockMilestone } from '../../../utils/mock-helpers.js';

describe('Milestone Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single milestone', () => {
      const milestone = createMockMilestone({
        id: 1,
        proposal_id: 100,
        title: 'Test Milestone',
      });

      create(milestone);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Milestone');
      expect(result?.proposalId).toBe(100);
    });
  });

  describe('createMany', () => {
    it('should insert multiple milestones', () => {
      const milestones = [
        createMockMilestone({ id: 1, proposal_id: 100 }),
        createMockMilestone({ id: 2, proposal_id: 100 }),
        createMockMilestone({ id: 3, proposal_id: 200 }),
      ];

      createMany(milestones);

      const all = findAll();
      expect(all.length).toBe(3);
    });

    it('should handle chunking for large batches', () => {
      const milestones = Array.from({ length: 250 }, (_, i) =>
        createMockMilestone({
          id: i + 1,
          proposal_id: 100,
        }),
      );

      createMany(milestones, { chunkSize: 100 });

      const all = findAll();
      expect(all.length).toBe(250);
    });

    it('should use default chunk size when not specified', () => {
      const milestones = Array.from({ length: 150 }, (_, i) =>
        createMockMilestone({
          id: i + 1,
          proposal_id: 100,
        }),
      );

      createMany(milestones);

      const all = findAll();
      expect(all.length).toBe(150);
    });
  });

  describe('findAll', () => {
    it('should return all milestones', () => {
      create(createMockMilestone({ id: 1, proposal_id: 100 }));
      create(createMockMilestone({ id: 2, proposal_id: 200 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no milestones exist', () => {
      const result = findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByProposalId', () => {
    it('should find milestones by proposal ID', () => {
      create(createMockMilestone({ id: 1, proposal_id: 100 }));
      create(createMockMilestone({ id: 2, proposal_id: 100 }));
      create(createMockMilestone({ id: 3, proposal_id: 200 }));

      const result = findByProposalId(100);
      expect(result.length).toBe(2);
      expect(result.every((m) => m.proposalId === 100)).toBe(true);
    });

    it('should return empty array when no milestones found for proposal', () => {
      const result = findByProposalId(999);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find milestone by ID', () => {
      const milestone = createMockMilestone({
        id: 1,
        proposal_id: 100,
        title: 'Specific Milestone',
      });
      create(milestone);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Specific Milestone');
    });

    it('should return undefined when milestone not found', () => {
      const result = findById(999);
      expect(result).toBeUndefined();
    });
  });
});
