import type { ContributionScoreParams } from '../types.js';
import type { OwnerBonusResult } from './owner-bonus.js';
import type { SelfInteractionResult } from './self-interaction.js';
import type { TimeWeightResult } from './time-weight.js';
import type { VoteStats } from './vote-aggregation.js';

export interface CommentScoreInput {
  votes: VoteStats;
  params: ContributionScoreParams;
  timeWeight: TimeWeightResult;
  selfInteraction: SelfInteractionResult;
  ownerBonus: OwnerBonusResult;
}

export interface CommentScoreResult {
  score: number;
  scored: boolean;
}

/**
 * Calculate base score from comment metrics and vote weights.
 *
 * @param votes - Vote statistics
 * @param params - Algorithm parameters
 * @returns Base score value
 */
export function calculateBaseScore(votes: VoteStats, params: ContributionScoreParams): number {
  return (
    params.commentBaseScore +
    votes.upvotes * params.commentUpvoteWeight -
    votes.downvotes * params.commentDownvoteWeight
  );
}

/**
 * Calculate the final comment score.
 *
 * @param input - Scoring input data
 * @returns Comment score and whether it was scored
 */
export function computeCommentScore(input: CommentScoreInput): CommentScoreResult {
  const { votes, params, timeWeight, selfInteraction, ownerBonus } = input;

  // Skip if time weight is invalid or outside window
  if (!timeWeight.isValid || !timeWeight.isWithinWindow) {
    return { score: 0, scored: false };
  }

  const baseScore = calculateBaseScore(votes, params);
  const score = ownerBonus.ownerBonus * timeWeight.tw * selfInteraction.discountMultiplier * baseScore;

  return { score, scored: true };
}
