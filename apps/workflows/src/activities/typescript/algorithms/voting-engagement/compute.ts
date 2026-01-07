import type { Snapshot } from '@reputo/database';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import config from '../../../../config/index.js';
import type { AlgorithmResult, VoteRecord, VotingEngagementResult } from '../../../../shared/types/index.js';
import { getInputValue } from '../../../../shared/utils/algorithm-input.utils.js';

const MAX_VOTING_ENTROPY = Math.log2(11);

const VALID_VOTES = ['skip', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function computeScores(
  votes: VoteRecord[],
  logger: { info: (msg: string, ctx?: Record<string, unknown>) => void },
): VotingEngagementResult[] {
  const votesByVoter = new Map<string, string[]>();
  let validVotesCount = 0;
  let invalidVotesCount = 0;

  // Group votes by voter
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

  logger.info('Vote processing summary', {
    totalVotes: votes.length,
    validVotes: validVotesCount,
    invalidVotes: invalidVotesCount,
    uniqueVoters: votesByVoter.size,
  });

  const results: VotingEngagementResult[] = [];

  // Compute engagement for each voter
  for (const [voterId, voterVotes] of votesByVoter.entries()) {
    const totalVotes = voterVotes.length;

    if (totalVotes === 0) {
      results.push({ collection_id: voterId, voting_engagement: 0 });
      continue;
    }

    // Count votes per category
    const voteCounts = new Array(11).fill(0);
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
    const votingEngagement = entropy / MAX_VOTING_ENTROPY;

    results.push({
      collection_id: voterId,
      voting_engagement: votingEngagement,
    });
  }

  // Sort by collection_id for deterministic output
  results.sort((a, b) => a.collection_id.localeCompare(b.collection_id));

  return results;
}

/**
 * Computes voting engagement scores.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeVotingEngagement(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const snapshotId = String((snapshot as unknown as { _id: string })._id);
  const { key: algorithmKey, version: algorithmVersion, inputs } = snapshot.algorithmPresetFrozen;
  const logger = Context.current().log;

  logger.info('Starting voting_engagement algorithm', {
    snapshotId,
    algorithmKey,
    algorithmVersion,
  });

  const { bucket } = config.storage;

  // Get votes input file location
  const votesKey = getInputValue(inputs, 'votes');
  logger.debug('Resolved votes input location', { votesKey });

  // Download and parse votes CSV
  const buffer = await storage.getObject({ bucket, key: votesKey });
  const csvText = buffer.toString('utf8');

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as VoteRecord[];

  logger.info('Parsed input votes', { rowCount: rows.length });

  // Execute computation
  const results = computeScores(rows, {
    info: (msg, ctx) => logger.info(msg, ctx ?? {}),
  });

  logger.info('Computed voting engagement scores', {
    resultCount: results.length,
  });

  // Generate and upload CSV output
  const outputCsv = stringify(results, {
    header: true,
    columns: ['collection_id', 'voting_engagement'],
  });

  const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`);
  await storage.putObject({
    bucket,
    key: outputKey,
    body: outputCsv,
    contentType: 'text/csv',
  });

  logger.info('Uploaded voting engagement results', { outputKey });

  return {
    outputs: {
      voting_engagement: outputKey,
    },
  };
}
