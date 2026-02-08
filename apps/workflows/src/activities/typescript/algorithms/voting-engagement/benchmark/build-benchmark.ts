import type { VoteGroupingStats } from '../pipeline/vote-grouping.js';
import {
  roundScore,
  VALID_VOTES,
  type ValidVote,
  type VoterBenchmarkRecord,
  type VotingEngagementBenchmark,
} from '../types.js';

/**
 * Build a per-voter benchmark record from pipeline outputs.
 * Computes vote distribution and raw entropy for diagnostic visibility.
 */
export function buildVoterBenchmarkRecord(
  collectionId: string,
  voterVotes: ValidVote[],
  votingEngagement: number,
): VoterBenchmarkRecord {
  const totalVotes = voterVotes.length;

  // Build vote distribution across 11 categories
  const voteDistribution = Object.fromEntries(VALID_VOTES.map((v) => [v, 0])) as Record<ValidVote, number>;
  for (const vote of voterVotes) {
    voteDistribution[vote]++;
  }

  // Compute raw Shannon entropy for benchmark visibility
  let entropy = 0;
  if (totalVotes > 0) {
    for (const count of Object.values(voteDistribution)) {
      if (count > 0) {
        const prob = count / totalVotes;
        entropy -= prob * Math.log2(prob);
      }
    }
  }

  return {
    collection_id: collectionId,
    total_votes: totalVotes,
    vote_distribution: voteDistribution,
    entropy: roundScore(entropy),
    voting_engagement: votingEngagement,
  };
}

export interface FormatBenchmarkInput {
  records: VoterBenchmarkRecord[];
  snapshotId: string;
  stats: VoteGroupingStats;
}

/**
 * Format benchmark records into the final output structure with metadata.
 */
export function formatBenchmarkOutput(input: FormatBenchmarkInput): VotingEngagementBenchmark {
  const { records, snapshotId, stats } = input;

  const sortedRecords = [...records].sort((a, b) => a.collection_id.localeCompare(b.collection_id));

  return {
    voters: sortedRecords,
    metadata: {
      snapshot_id: snapshotId,
      computed_at: new Date().toISOString(),
      metrics: {
        total_votes_in_file: stats.totalVotes,
        valid_votes: stats.validVotes,
        invalid_votes: stats.invalidVotes,
        unique_voters: stats.uniqueVoters,
      },
    },
  };
}
