import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommentVotesRepo } from '../../../../src/resources/commentVotes/repository.js';
import type { DeepFundingPortalDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockCommentVote } from '../../../utils/mock-helpers.js';

describe('CommentVote Repository', () => {
  let db: DeepFundingPortalDb;
  let repo: ReturnType<typeof createCommentVotesRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createCommentVotesRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single comment vote', () => {
      const vote = createMockCommentVote({
        voter_id: 1,
        comment_id: 10,
      });

      repo.create(vote);

      const all = repo.findAll();
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

      repo.createMany(votes);

      const all = repo.findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all comment votes', () => {
      repo.create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      repo.create(createMockCommentVote({ voter_id: 2, comment_id: 20 }));

      const result = repo.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByCommentId', () => {
    it('should find votes by comment ID', () => {
      repo.create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      repo.create(createMockCommentVote({ voter_id: 2, comment_id: 10 }));
      repo.create(createMockCommentVote({ voter_id: 3, comment_id: 20 }));

      const result = repo.findByCommentId(10);
      expect(result.length).toBe(2);
      expect(result.every((v) => v.commentId === 10)).toBe(true);
    });
  });

  describe('findByVoterId', () => {
    it('should find votes by voter ID', () => {
      repo.create(createMockCommentVote({ voter_id: 1, comment_id: 10 }));
      repo.create(createMockCommentVote({ voter_id: 1, comment_id: 20 }));
      repo.create(createMockCommentVote({ voter_id: 2, comment_id: 30 }));

      const result = repo.findByVoterId(1);
      expect(result.length).toBe(2);
      expect(result.every((v) => v.voterId === 1)).toBe(true);
    });
  });
});
