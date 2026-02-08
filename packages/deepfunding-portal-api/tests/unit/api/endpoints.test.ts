import { describe, expect, it } from 'vitest';
import { endpoints } from '../../../src/api/endpoints.js';

describe('API Endpoints', () => {
  describe('endpoints', () => {
    it('should return correct path for rounds', () => {
      expect(endpoints.rounds()).toBe('/rounds');
    });

    it('should return correct path for pools', () => {
      expect(endpoints.pools()).toBe('/pools');
    });

    it('should return correct path for proposals with roundId', () => {
      expect(endpoints.proposals(1)).toBe('/rounds/1/proposals');
      expect(endpoints.proposals(42)).toBe('/rounds/42/proposals');
    });

    it('should return correct path for users', () => {
      expect(endpoints.users()).toBe('/users');
    });

    it('should return correct path for milestones', () => {
      expect(endpoints.milestones()).toBe('/milestones');
    });

    it('should return correct path for reviews', () => {
      expect(endpoints.reviews()).toBe('/reviews');
    });

    it('should return correct path for comments', () => {
      expect(endpoints.comments()).toBe('/comments');
    });

    it('should return correct path for comment votes', () => {
      expect(endpoints.commentVotes()).toBe('/comment_votes');
    });
  });
});
