import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMilestonesRepo } from '../../../../src/resources/milestones/repository.js';
import type { DeepFundingPortalDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockMilestone } from '../../../utils/mock-helpers.js';

describe('Milestone Repository', () => {
  let db: DeepFundingPortalDb;
  let repo: ReturnType<typeof createMilestonesRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createMilestonesRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single milestone', () => {
      const milestone = createMockMilestone({
        id: 1,
        proposal_id: 100,
        title: 'Test Milestone',
      });

      repo.create(milestone);

      const result = repo.findById(1);
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

      repo.createMany(milestones);

      const all = repo.findAll();
      expect(all.length).toBe(3);
    });

    it('should handle chunking for large batches', () => {
      const milestones = Array.from({ length: 250 }, (_, i) =>
        createMockMilestone({
          id: i + 1,
          proposal_id: 100,
        }),
      );

      repo.createMany(milestones, { chunkSize: 100 });

      const all = repo.findAll();
      expect(all.length).toBe(250);
    });

    it('should use default chunk size when not specified', () => {
      const milestones = Array.from({ length: 150 }, (_, i) =>
        createMockMilestone({
          id: i + 1,
          proposal_id: 100,
        }),
      );

      repo.createMany(milestones);

      const all = repo.findAll();
      expect(all.length).toBe(150);
    });
  });

  describe('findAll', () => {
    it('should return all milestones', () => {
      repo.create(createMockMilestone({ id: 1, proposal_id: 100 }));
      repo.create(createMockMilestone({ id: 2, proposal_id: 200 }));

      const result = repo.findAll();
      expect(result.length).toBe(2);
    });

    it('should return empty array when no milestones exist', () => {
      const result = repo.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByProposalId', () => {
    it('should find milestones by proposal ID', () => {
      repo.create(createMockMilestone({ id: 1, proposal_id: 100 }));
      repo.create(createMockMilestone({ id: 2, proposal_id: 100 }));
      repo.create(createMockMilestone({ id: 3, proposal_id: 200 }));

      const result = repo.findByProposalId(100);
      expect(result.length).toBe(2);
      expect(result.every((m) => m.proposalId === 100)).toBe(true);
    });

    it('should return empty array when no milestones found for proposal', () => {
      const result = repo.findByProposalId(999);
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
      repo.create(milestone);

      const result = repo.findById(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.title).toBe('Specific Milestone');
    });

    it('should return undefined when milestone not found', () => {
      const result = repo.findById(999);
      expect(result).toBeUndefined();
    });
  });
});
