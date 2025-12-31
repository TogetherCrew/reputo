import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  create,
  createMany,
  findAll,
  findById,
  findByProposalId,
  findByReviewerId,
} from '../../../../src/resources/reviews/repository.js';
import { cleanupTestDb, createTestDb } from '../../../utils/db-helpers.js';
import { createMockReview } from '../../../utils/mock-helpers.js';

describe('Review Repository', () => {
  beforeEach(() => {
    createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('create', () => {
    it('should insert a single review', () => {
      const review = createMockReview({
        proposal_id: 100,
        reviewer_id: 10,
      });

      create(review);

      const all = findAll();
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

      createMany(reviews);

      const all = findAll();
      expect(all.length).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return all reviews', () => {
      create(createMockReview({ proposal_id: 100 }));
      create(createMockReview({ proposal_id: 200 }));

      const result = findAll();
      expect(result.length).toBe(2);
    });
  });

  describe('findByProposalId', () => {
    it('should find reviews by proposal ID', () => {
      create(createMockReview({ proposal_id: 100, reviewer_id: 10 }));
      create(createMockReview({ proposal_id: 100, reviewer_id: 20 }));
      create(createMockReview({ proposal_id: 200, reviewer_id: 10 }));

      const result = findByProposalId(100);
      expect(result.length).toBe(2);
      expect(result.every((r) => r.proposalId === 100)).toBe(true);
    });
  });

  describe('findByReviewerId', () => {
    it('should find reviews by reviewer ID', () => {
      create(createMockReview({ proposal_id: 100, reviewer_id: 10 }));
      create(createMockReview({ proposal_id: 200, reviewer_id: 10 }));
      create(createMockReview({ proposal_id: 300, reviewer_id: 20 }));

      const result = findByReviewerId(10);
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
      create(review);

      const all = findAll();
      const firstReview = all[0];
      if (firstReview) {
        const result = findById(firstReview.reviewId);
        expect(result).toBeDefined();
        expect(result?.reviewId).toBe(firstReview.reviewId);
        expect(result?.reviewType).toBe('expert');
      }
    });
  });
});
