import { describe, expect, it } from 'vitest';
import {
  computeProposalScore,
  type ProposalScoreInput,
  SUPPORTED_ROUND_IDS,
} from '../../../src/activities/typescript/algorithms/proposal-engagement/pipeline/proposal-scoring.js';

function validInput(overrides: Partial<ProposalScoreInput> = {}): ProposalScoreInput {
  return {
    roundId: 31,
    classification: 'funded_concluded',
    communityScore: { count: 5, avg: 4.0, norm: 0.75 },
    timeWeight: { tw: 0.9, ageMonths: 2, bucketIndex: 1, isValid: true, isWithinWindow: true },
    ...overrides,
  };
}

describe('computeProposalScore', () => {
  describe('skip reasons (precedence order)', () => {
    it('skips with unsupported_round for unknown round ids', () => {
      const result = computeProposalScore(validInput({ roundId: 999 }));

      expect(result).toEqual({
        proposalReward: 0,
        proposalPenalty: 0,
        scored: false,
        skipReason: 'unsupported_round',
      });
    });

    it('skips with invalid_created_at when timeWeight is invalid', () => {
      const result = computeProposalScore(
        validInput({
          timeWeight: { tw: 0, ageMonths: 0, bucketIndex: 0, isValid: false, isWithinWindow: false },
        }),
      );

      expect(result).toEqual({
        proposalReward: 0,
        proposalPenalty: 0,
        scored: false,
        skipReason: 'invalid_created_at',
      });
    });

    it('skips with outside_engagement_window when not within window', () => {
      const result = computeProposalScore(
        validInput({
          timeWeight: { tw: 0, ageMonths: 24, bucketIndex: 0, isValid: true, isWithinWindow: false },
        }),
      );

      expect(result).toEqual({
        proposalReward: 0,
        proposalPenalty: 0,
        scored: false,
        skipReason: 'outside_engagement_window',
      });
    });

    it('skips with no_community_reviews when norm is null', () => {
      const result = computeProposalScore(validInput({ communityScore: { count: 0, avg: null, norm: null } }));

      expect(result).toEqual({
        proposalReward: 0,
        proposalPenalty: 0,
        scored: false,
        skipReason: 'no_community_reviews',
      });
    });

    it('skips with not_reward_or_penalty_class for "other" classification', () => {
      const result = computeProposalScore(validInput({ classification: 'other' }));

      expect(result).toEqual({
        proposalReward: 0,
        proposalPenalty: 0,
        scored: false,
        skipReason: 'not_reward_or_penalty_class',
      });
    });
  });

  describe('scoring', () => {
    it('computes reward = tw * norm for funded_concluded', () => {
      const result = computeProposalScore(
        validInput({
          classification: 'funded_concluded',
          communityScore: { count: 3, avg: 4.0, norm: 0.8 },
          timeWeight: { tw: 0.5, ageMonths: 6, bucketIndex: 2, isValid: true, isWithinWindow: true },
        }),
      );

      expect(result.proposalReward).toBeCloseTo(0.4);
      expect(result.proposalPenalty).toBe(0);
      expect(result.scored).toBe(true);
      expect(result.skipReason).toBeNull();
    });

    it('computes penalty = tw * (1 - norm) for unfunded', () => {
      const result = computeProposalScore(
        validInput({
          classification: 'unfunded',
          communityScore: { count: 3, avg: 2.0, norm: 0.3 },
          timeWeight: { tw: 0.5, ageMonths: 6, bucketIndex: 2, isValid: true, isWithinWindow: true },
        }),
      );

      expect(result.proposalReward).toBe(0);
      expect(result.proposalPenalty).toBeCloseTo(0.35);
      expect(result.scored).toBe(true);
      expect(result.skipReason).toBeNull();
    });

    it('returns scored=false when reward and penalty are both zero', () => {
      const result = computeProposalScore(
        validInput({
          classification: 'funded_concluded',
          communityScore: { count: 1, avg: 0, norm: 0 },
          timeWeight: { tw: 0.5, ageMonths: 1, bucketIndex: 0, isValid: true, isWithinWindow: true },
        }),
      );

      expect(result.proposalReward).toBe(0);
      expect(result.proposalPenalty).toBe(0);
      expect(result.scored).toBe(false);
      expect(result.skipReason).toBeNull();
    });
  });

  describe('SUPPORTED_ROUND_IDS', () => {
    it.each([31, 36, 107])('includes round %d', (roundId) => {
      expect(SUPPORTED_ROUND_IDS.has(roundId)).toBe(true);
    });

    it('does not include arbitrary round ids', () => {
      expect(SUPPORTED_ROUND_IDS.has(1)).toBe(false);
    });
  });
});
