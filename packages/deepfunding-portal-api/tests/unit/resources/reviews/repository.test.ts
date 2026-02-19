import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createReviewsRepo } from '../../../../src/resources/reviews/repository.js';
import type { DeepFundingPortalDb } from '../../../../src/shared/types/db.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockReview } from '../../../utils/mock-helpers.js';

describe('Review Repository', () => {
  let db: DeepFundingPortalDb;
  let repo: ReturnType<typeof createReviewsRepo>;

  beforeEach(() => {
    db = createTestDb();
    repo = createReviewsRepo(db);
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('create', () => {
    it('should insert a single review', () => {
      const review = createMockReview({
        proposal_id: 100,
        reviewer_id: 10,
      });

      repo.create(review);

      const all = repo.findAll();
      expect(all.length).toBe(1);
      expect(all[0]?.proposalId).toBe(100);
      expect(all[0]?.reviewerId).toBe(10);
    });
  });

  describe('createMany', () => {
    it('should insert multiple reviews', () => {
      const reviews = [
        createMockReview({ proposal_id: 100, reviewer_id: 10 }),
        createMockReview({ proposal_id: 100, reviewer_id: 20 }),
        createMockReview({ proposal_id: 200, reviewer_id: 10 }),
      ];

      repo.createMany(reviews);

      const all = repo.findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all reviews', () => {
      repo.create(createMockReview({ proposal_id: 100 }));
      repo.create(createMockReview({ proposal_id: 200 }));

      const result = repo.findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByProposalId', () => {
    it('should find reviews by proposal ID', () => {
      repo.create(createMockReview({ proposal_id: 100, reviewer_id: 10 }));
      repo.create(createMockReview({ proposal_id: 100, reviewer_id: 20 }));
      repo.create(createMockReview({ proposal_id: 200, reviewer_id: 10 }));

      const result = repo.findByProposalId(100);
      expect(result.length).toBe(2);
      expect(result.every((r) => r.proposalId === 100)).toBe(true);
    });
  });

  describe('findByReviewerId', () => {
    it('should find reviews by reviewer ID', () => {
      repo.create(createMockReview({ proposal_id: 100, reviewer_id: 10 }));
      repo.create(createMockReview({ proposal_id: 200, reviewer_id: 10 }));
      repo.create(createMockReview({ proposal_id: 300, reviewer_id: 20 }));

      const result = repo.findByReviewerId(10);
      expect(result.length).toBe(2);
      expect(result.every((r) => r.reviewerId === 10)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find review by ID', () => {
      const review = createMockReview({
        proposal_id: 100,
        review_type: 'expert',
      });
      repo.create(review);

      const all = repo.findAll();
      const firstReview = all[0];
      if (firstReview) {
        const result = repo.findById(firstReview.reviewId);
        expect(result).toBeDefined();
        expect(result?.reviewId).toBe(firstReview.reviewId);
        expect(result?.reviewType).toBe('expert');
      }
    });
  });
});
