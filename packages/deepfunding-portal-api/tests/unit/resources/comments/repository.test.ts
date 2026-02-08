import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  create,
  createMany,
  findAll,
  findById,
  findByProposalId,
  findByUserId,
} from '../../../../src/resources/comments/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockComment } from '../../../utils/mock-helpers.js';

describe('Comment Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single comment', () => {
      const comment = createMockComment({
        comment_id: 1,
        proposal_id: 100,
      });

      create(comment);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.proposalId).toBe(100);
    });
  });

  describe('createMany', () => {
    it('should insert multiple comments', () => {
      const comments = [
        createMockComment({ comment_id: 1, proposal_id: 100 }),
        createMockComment({ comment_id: 2, proposal_id: 100 }),
        createMockComment({ comment_id: 3, proposal_id: 200 }),
      ];

      createMany(comments);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all comments', () => {
      create(createMockComment({ comment_id: 1 }));
      create(createMockComment({ comment_id: 2 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByProposalId', () => {
    it('should find comments by proposal ID', () => {
      create(createMockComment({ comment_id: 1, proposal_id: 100 }));
      create(createMockComment({ comment_id: 2, proposal_id: 100 }));
      create(createMockComment({ comment_id: 3, proposal_id: 200 }));

      const result = findByProposalId(100);
      expect(result.length).toBe(2);
      expect(result.every((c) => c.proposalId === 100)).toBe(true);
    });
  });

  describe('findByUserId', () => {
    it('should find comments by user ID', () => {
      create(createMockComment({ comment_id: 1, user_id: 10 }));
      create(createMockComment({ comment_id: 2, user_id: 10 }));
      create(createMockComment({ comment_id: 3, user_id: 20 }));

      const result = findByUserId(10);
      expect(result.length).toBe(2);
      expect(result.every((c) => c.userId === 10)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find comment by ID', () => {
      const comment = createMockComment({
        comment_id: 1,
        content: 'Specific comment',
      });
      create(comment);

      const result = findById(1);
      expect(result).toBeDefined();
      expect(result?.commentId).toBe(1);
      expect(result?.content).toBe('Specific comment');
    });
  });
});
