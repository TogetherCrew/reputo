import type { VoteStats } from './vote-aggregation.js';

export interface OwnerBonusResult {
  ownerUpvoted: boolean;
  ownerBonus: number;
}

/**
 * Check if any project owner upvoted the comment and compute bonus.
 *
 * @param proposalId - The proposal ID
 * @param votes - Vote statistics for the comment
 * @param projectOwnerMap - Map of proposal ID to owner user IDs
 * @param bonusMultiplier - Multiplier to apply when owner upvoted
 * @returns Owner bonus result
 */
export function computeOwnerBonus(
  proposalId: number,
  votes: VoteStats,
  projectOwnerMap: Map<number, Set<number>>,
  bonusMultiplier: number,
): OwnerBonusResult {
  const projectOwners = projectOwnerMap.get(proposalId);

  if (!projectOwners) {
    return { ownerUpvoted: false, ownerBonus: 1 };
  }

  for (const upvoterId of votes.upvoterIds) {
    if (projectOwners.has(upvoterId)) {
      return { ownerUpvoted: true, ownerBonus: bonusMultiplier };
    }
  }

  return { ownerUpvoted: false, ownerBonus: 1 };
}
