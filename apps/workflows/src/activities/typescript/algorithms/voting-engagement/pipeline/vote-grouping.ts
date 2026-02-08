import type { VoteRecord } from '../../../../../shared/types/index.js';
import { VALID_VOTES, type ValidVote } from '../types.js';

export interface VoteGroupingStats {
  totalVotes: number;
  validVotes: number;
  invalidVotes: number;
  uniqueVoters: number;
}

/**
 * Group votes by voter ID, filtering invalid votes.
 *
 * @param votes - Raw vote records
 * @returns Map of voter ID to their valid votes and processing stats
 */
export function groupVotesByVoter(votes: VoteRecord[]): {
  votesByVoter: Map<string, ValidVote[]>;
  stats: VoteGroupingStats;
} {
  const votesByVoter = new Map<string, ValidVote[]>();
  let validVotesCount = 0;
  let invalidVotesCount = 0;

  for (const vote of votes) {
    const voterId =
      vote.collection_id !== null && vote.collection_id !== undefined && typeof vote.collection_id === 'string'
        ? vote.collection_id.trim()
        : null;

    const questionId =
      vote.question_id !== null && vote.question_id !== undefined && typeof vote.question_id === 'string'
        ? vote.question_id.trim()
        : null;

    const rawVote = vote.answer !== null && vote.answer !== undefined ? String(vote.answer) : null;

    if (!voterId || !questionId || !rawVote) {
      invalidVotesCount++;
      continue;
    }

    const voteValue = rawVote.trim().toLowerCase();

    if (!voteValue || !VALID_VOTES.includes(voteValue as ValidVote)) {
      invalidVotesCount++;
      continue;
    }

    validVotesCount++;
    if (!votesByVoter.has(voterId)) {
      votesByVoter.set(voterId, []);
    }
    votesByVoter.get(voterId)?.push(voteValue as ValidVote);
  }

  return {
    votesByVoter,
    stats: {
      totalVotes: votes.length,
      validVotes: validVotesCount,
      invalidVotes: invalidVotesCount,
      uniqueVoters: votesByVoter.size,
    },
  };
}
