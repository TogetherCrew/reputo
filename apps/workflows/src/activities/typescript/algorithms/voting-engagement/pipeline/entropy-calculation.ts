import { MAX_VOTING_ENTROPY, VALID_VOTES, type ValidVote } from '../types.js';

/**
 * Calculate voting engagement score using Shannon entropy.
 *
 * Engagement is normalized entropy of vote distribution across 11 categories.
 * Higher entropy = more varied voting = higher engagement.
 *
 * @param voterVotes - Array of valid votes for a voter
 * @returns Normalized voting engagement score (0-1)
 */
export function calculateVotingEngagement(voterVotes: ValidVote[]): number {
  const totalVotes = voterVotes.length;

  if (totalVotes === 0) {
    return 0;
  }

  // Count votes per category (11 categories: skip + 1-10)
  const voteCounts = new Array(11).fill(0) as number[];
  for (const voteValue of voterVotes) {
    const index = VALID_VOTES.indexOf(voteValue);
    if (index >= 0) {
      voteCounts[index]++;
    }
  }

  // Calculate probability distribution
  const probabilities = voteCounts.map((count) => count / totalVotes);

  // Compute Shannon entropy
  let entropy = 0;
  for (const prob of probabilities) {
    if (prob > 0) {
      entropy -= prob * Math.log2(prob);
    }
  }

  // Normalize by max entropy
  return entropy / MAX_VOTING_ENTROPY;
}
