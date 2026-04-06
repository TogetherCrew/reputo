import type { VoteRecord } from '../../../../../shared/types/index.js';
import { VALID_VOTES, type ValidVote } from '../types.js';

export interface VoteGroupingStats {
  totalVotes: number;
  validVotes: number;
  invalidVotes: number;
  targetedVoterIds: number;
}

export function groupVotesByVoter(
  votes: VoteRecord[],
  allowedVoterIds?: Set<string>,
): {
  votesByVoter: Map<string, ValidVote[]>;
  stats: VoteGroupingStats;
} {
  const votesByVoter = new Map<string, ValidVote[]>();
  let validVotesCount = 0;
  let invalidVotesCount = 0;

  for (const vote of votes) {
    const voterId = vote.collection_id.trim();
    const questionId = vote.question_id.trim();
    const rawVote = vote.answer.trim().toLowerCase();

    if (!voterId || !questionId || !rawVote) {
      invalidVotesCount++;
      continue;
    }

    if (allowedVoterIds && !allowedVoterIds.has(voterId)) {
      continue;
    }

    const voteValue = rawVote;

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
      targetedVoterIds: allowedVoterIds?.size ?? votesByVoter.size,
    },
  };
}
