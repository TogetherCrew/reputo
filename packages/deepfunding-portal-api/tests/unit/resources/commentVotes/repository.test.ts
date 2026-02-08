import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  create,
  createMany,
  findAll,
  findByCommentId,
  findByVoterId,
} from '../../../../src/resources/commentVotes/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockCommentVote } from '../../../utils/mock-helpers.js';

describe('CommentVote Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single comment vote', () => {
      const vote = createMockCommentVote({
        voter_id: 1,
        comment_id: 10,
      });

      create(vote);

      const all = findAll();
      expect(all.length).toBe(1);
      expect(all[0]?.voterId).toBe(1);
      expect(all[0]?.commentId).toBe(10);
    });
  });

  describe('createMany', () => {
    it('should insert multiple comment votes', () => {
      const votes = [
        createMockCommentVote({ voter_id: 1, comment_id: 10 }),
        createMockCommentVote({ voter_id: 2, comment_id: 10 }),
        createMockCommentVote({ voter_id: 1, comment_id: 20 }),
      ];

      createMany(votes);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all comment votes', () => {
      create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      create(createMockCommentVote({ voter_id: 2, comment_id: 20 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByCommentId', () => {
    it('should find votes by comment ID', () => {
      create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      create(createMockCommentVote({ voter_id: 2, comment_id: 10 }));
      create(createMockCommentVote({ voter_id: 3, comment_id: 20 }));

      const result = findByCommentId(10);
      expect(result.length).toBe(2);
      expect(result.every((v) => v.commentId === 10)).toBe(true);
    });
  });

  describe('findByVoterId', () => {
    it('should find votes by voter ID', () => {
      create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      create(createMockCommentVote({ voter_id: 1, comment_id: 20 }));
      create(createMockCommentVote({ voter_id: 2, comment_id: 30 }));

      const result = findByVoterId(1);
      expect(result.length).toBe(2);
      expect(result.every((v) => v.voterId === 1)).toBe(true);
    });
  });
});
