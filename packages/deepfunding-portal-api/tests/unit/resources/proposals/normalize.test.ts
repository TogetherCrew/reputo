import { describe, expect, it } from 'vitest';
import { normalizeProposalToRecord } from '../../../../src/resources/proposals/normalize.js';
import { createMockProposal } from '../../../utils/mock-helpers.js';

describe('Proposal Normalization', () => {
  describe('normalizeProposalToRecord', () => {
    it('should transform API response to DB record format', () => {
      const proposal = createMockProposal({
        id: 1,
        round_id: 10,
        pool_id: 20,
        proposer_id: 30,
        title: 'Test Proposal',
        content: 'Test content',
        link: 'https://example.com',
        feature_image: 'https://example.com/image.jpg',
        requested_amount: '10000',
        awarded_amount: '5000',
        is_awarded: true,
        is_completed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        team_members: [{ name: 'John', role: 'Lead' }],
      });

      const result = normalizeProposalToRecord(proposal);

      expect(result.id).toBe(1);
      expect(result.roundId).toBe(10);
      expect(result.poolId).toBe(20);
      expect(result.proposerId).toBe(30);
      expect(result.title).toBe('Test Proposal');
      expect(result.content).toBe('Test content');
      expect(result.link).toBe('https://example.com');
      expect(result.featureImage).toBe('https://example.com/image.jpg');
      expect(result.requestedAmount).toBe('10000');
      expect(result.awardedAmount).toBe('5000');
      expect(result.isAwarded).toBe(true);
      expect(result.isCompleted).toBe(false);
      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-02T00:00:00Z');
      expect(JSON.parse(result.teamMembers)).toEqual([{ name: 'John', role: 'Lead' }]);
      expect(result.rawJson).toBe(JSON.stringify(proposal));
    });

    it('should handle null updated_at', () => {
      const proposal = createMockProposal({
        updated_at: undefined,
      });

      const result = normalizeProposalToRecord(proposal);
      expect(result.updatedAt).toBeNull();
    });

    it('should handle empty team_members array', () => {
      const proposal = createMockProposal({
        team_members: [],
      });

      const result = normalizeProposalToRecord(proposal);
      expect(JSON.parse(result.teamMembers)).toEqual([]);
    });

    it('should serialize raw JSON correctly', () => {
      const proposal = createMockProposal({
        id: 42,
        title: 'Complex Proposal',
      });

      const result = normalizeProposalToRecord(proposal);
      const parsed = JSON.parse(result.rawJson);

      expect(parsed.id).toBe(42);
      expect(parsed.title).toBe('Complex Proposal');
    });
  });
});
