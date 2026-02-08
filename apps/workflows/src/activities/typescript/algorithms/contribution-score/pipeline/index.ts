export {
  type CommentScoreInput,
  type CommentScoreResult,
  calculateBaseScore,
  computeCommentScore,
} from './comment-scoring.js';
export {
  computeOwnerBonus,
  type OwnerBonusResult,
} from './owner-bonus.js';

export {
  detectSelfInteraction,
  type SelfInteractionContext,
  type SelfInteractionResult,
} from './self-interaction.js';
export {
  calculateTimeWeight,
  computeTimeWeightFromString,
  type TimeWeightParams,
  type TimeWeightResult,
} from './time-weight.js';
export {
  aggregateVotesByComment,
  getVoteStats,
  type VoteStats,
} from './vote-aggregation.js';
