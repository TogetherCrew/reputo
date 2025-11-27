import type { Storage } from '@reputo/storage';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import pino from 'pino';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

// Create activity-specific logger
const logger = pino().child({ activity: 'voting-engagement' });

/**
 * Input record for voting_engagement algorithm.
 * Note: collection_id in the input represents the voter/user identifier.
 * Required fields: question_id, collection_id, answer.
 * Only primary column names from the schema are used (no aliases).
 */
interface VoteRecord {
  id?: number; // Row identifier
  event_id?: number; // Voting event identifier
  answer: string; // "skip" or "1".."10" (required)
  created_on?: string; // Creation timestamp
  updated_on?: string; // Last update timestamp
  question_id: string; // Unique proposal/question identifier (required)
  balance?: number; // Balance at time of vote
  stake?: number; // Stake associated with the vote
  collection_id: string; // Unique voter identifier (required)
  vote_id?: number; // Vote identifier
}

/**
 * Output record for voting_engagement algorithm.
 * collection_id represents the voter/user identifier.
 */
interface VotingEngagementResult {
  collection_id: string; // Voter identifier
  voting_engagement: number; // Ve(i) in [0,1]
}

/**
 * Activity implementation for the voting_engagement algorithm.
 *
 * This algorithm computes voting engagement scores for voters/users
 * based on voting entropy. Voting engagement Ve(i) = H(i)/log2(11) where
 * H(i) is the entropy of user i's voting behavior over {skip, 1..10}.
 *
 * @param payload - Workflow payload containing snapshot and input locations
 * @returns Output locations for computed results
 */
export async function voting_engagement(payload: WorkerAlgorithmPayload): Promise<WorkerAlgorithmResult> {
  const { snapshotId, algorithmKey, algorithmVersion, inputLocations } = payload;

  logger.info(
    {
      snapshotId,
      algorithmKey,
      algorithmVersion,
    },
    'Starting voting_engagement algorithm',
  );

  try {
    // Get storage instance from global (initialized in worker/main.ts)
    const storage = global.storage;
    if (!storage) {
      throw new Error('Storage instance not initialized. Ensure worker is properly started.');
    }

    // 1. Resolve input location
    const votesKey = getInputLocation(inputLocations, 'votes');
    logger.debug({ votesKey }, 'Resolved votes input location');

    // 2. Download and parse input CSV
    const buffer = await storage.getObject(votesKey);
    const csvText = buffer.toString('utf8');

    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as VoteRecord[];

    logger.info({ rowCount: rows.length }, 'Parsed input votes');

    // 3. Compute voting engagement for each voter
    const results = computeVotingEngagement(rows);

    logger.info(
      {
        resultCount: results.length,
      },
      'Computed voting engagement scores',
    );

    // 4. Serialize results to CSV
    const outputCsv = stringify(results, {
      header: true,
      columns: ['collection_id', 'voting_engagement'],
    });

    // 5. Upload output to storage
    const outputKey = `snapshots/${snapshotId}/outputs/${algorithmKey}.csv`;
    await storage.putObject(outputKey, outputCsv, 'text/csv');

    logger.info({ outputKey }, 'Uploaded voting engagement results');

    // 6. Return output locations
    return {
      outputs: {
        voting_engagement: outputKey,
      },
    };
  } catch (error) {
    logger.error(
      {
        error: error as Error,
        snapshotId,
        algorithmKey,
      },
      'Failed to compute voting_engagement',
    );
    throw error;
  }
}

/**
 * Maximum voting entropy (when all options have equal probability).
 * H_max = log2(11) ≈ 3.45943
 */
const MAX_VOTING_ENTROPY = Math.log2(11);

/**
 * Valid vote values: skip (index 0) and ratings 1-10 (indices 1-10).
 */
const VALID_VOTES = ['skip', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

/**
 * Compute voting engagement scores from vote records.
 *
 * Voting engagement Ve(i) for voter i is computed as:
 * Ve(i) = H(i) / H_max
 *
 * Where H(i) is the voting entropy of voter i:
 * H(i) = -Σ(j=0 to 10) P_i(x_j) * log2(P_i(x_j))
 *
 * And P_i(x_j) is the probability of voter i using option x_j:
 * - x_0 = "skip"
 * - x_k = rating k (where k = 1 to 10)
 *
 * H_max = log2(11) is the maximum entropy when all options are equally likely.
 *
 * @param votes - Array of vote records
 * @returns Array of voting engagement results per voter
 */
function computeVotingEngagement(votes: VoteRecord[]): VotingEngagementResult[] {
  // Group votes by voter (collection_id represents the voter)
  const votesByVoter = new Map<string, string[]>();
  let validVotesCount = 0;
  let invalidVotesCount = 0;

  for (const vote of votes) {
    // Validate required fields: collection_id, question_id, answer
    // Handle cases where CSV parser might return undefined or empty strings
    const voterId =
      vote.collection_id !== null && vote.collection_id !== undefined && typeof vote.collection_id === 'string'
        ? vote.collection_id.trim()
        : null;

    const questionId =
      vote.question_id !== null && vote.question_id !== undefined && typeof vote.question_id === 'string'
        ? vote.question_id.trim()
        : null;

    const rawVote = vote.answer !== null && vote.answer !== undefined ? String(vote.answer) : null;

    // Skip votes with missing or empty required fields
    if (!voterId || !questionId || !rawVote) {
      invalidVotesCount++;
      continue;
    }

    // Normalize and validate vote value
    const voteValue = rawVote.trim().toLowerCase();

    // Validate vote value against allowed enum values
    if (!voteValue || !VALID_VOTES.includes(voteValue)) {
      invalidVotesCount++;
      continue;
    }

    validVotesCount++;
    if (!votesByVoter.has(voterId)) {
      votesByVoter.set(voterId, []);
    }
    votesByVoter.get(voterId)?.push(voteValue);
  }

  logger.info(
    {
      totalVotes: votes.length,
      validVotes: validVotesCount,
      invalidVotes: invalidVotesCount,
      uniqueVoters: votesByVoter.size,
    },
    'Vote processing summary',
  );

  // Compute voting engagement for each voter
  const results: VotingEngagementResult[] = [];

  for (const [voterId, voterVotes] of votesByVoter.entries()) {
    const totalVotes = voterVotes.length;

    if (totalVotes === 0) {
      // No valid votes, engagement is 0
      results.push({
        collection_id: voterId,
        voting_engagement: 0,
      });
      continue;
    }

    // Count votes for each option (skip=0, 1-10=1-10)
    const voteCounts = new Array(11).fill(0);
    for (const voteValue of voterVotes) {
      const index = VALID_VOTES.indexOf(voteValue);
      if (index >= 0) {
        voteCounts[index]++;
      }
    }

    // Calculate probability distribution P_i(x_j)
    const probabilities = voteCounts.map((count) => count / totalVotes);

    // Calculate entropy H_i = -Σ(j=0 to 10) P_i(x_j) * log2(P_i(x_j))
    // Using convention: 0 * log2(0) = 0
    let entropy = 0;
    for (const prob of probabilities) {
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    }

    // Calculate voting engagement Ve(i) = H(i) / H_max
    const votingEngagement = entropy / MAX_VOTING_ENTROPY;

    results.push({
      collection_id: voterId,
      voting_engagement: votingEngagement,
    });
  }

  // Sort by collection_id (voter_id) for deterministic output
  results.sort((a, b) => a.collection_id.localeCompare(b.collection_id));

  return results;
}
