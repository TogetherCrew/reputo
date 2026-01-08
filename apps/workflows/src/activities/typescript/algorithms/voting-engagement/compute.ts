import type { Snapshot } from '@reputo/database';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import { stringify } from 'csv-stringify/sync';
import type { HydratedDocument } from 'mongoose';

import config from '../../../../config/index.js';
import type { AlgorithmResult } from '../../../../shared/types/index.js';
import { calculateVotingEngagement, groupVotesByVoter } from './pipeline/index.js';
import type { VotingEngagementResult } from './types.js';
import { extractVotesKey, loadVotes } from './utils/index.js';

/**
 * Computes voting engagement scores.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeVotingEngagement(
  snapshot: HydratedDocument<Snapshot>,
  storage: Storage,
): Promise<AlgorithmResult> {
  const logger = Context.current().log;

  logger.info('Starting voting_engagement algorithm', {
    snapshotId: snapshot.id,
  });

  const { bucket } = config.storage;
  const votesKey = extractVotesKey(snapshot.algorithmPresetFrozen.inputs);

  logger.debug('Resolved votes input location', { votesKey });

  // Load and parse votes
  const votes = await loadVotes(storage, bucket, votesKey);

  logger.info('Parsed input votes', { rowCount: votes.length });

  // Group votes by voter
  const { votesByVoter, stats } = groupVotesByVoter(votes);

  logger.info('Vote processing summary', stats);

  // Compute engagement for each voter
  const results: VotingEngagementResult[] = [];

  for (const [voterId, voterVotes] of votesByVoter.entries()) {
    const votingEngagement = calculateVotingEngagement(voterVotes);
    results.push({
      collection_id: voterId,
      voting_engagement: votingEngagement,
    });
  }

  // Sort by collection_id for deterministic output
  results.sort((a, b) => a.collection_id.localeCompare(b.collection_id));

  logger.info('Computed voting engagement scores', {
    resultCount: results.length,
  });

  // Generate and upload CSV output
  const csvContent = stringify(results, {
    header: true,
    columns: ['collection_id', 'voting_engagement'],
  });

  const outputKey = generateKey('snapshot', snapshot.id, `${snapshot.algorithmPresetFrozen.key}.csv`);

  await storage.putObject({
    bucket,
    key: outputKey,
    body: csvContent,
    contentType: 'text/csv',
  });

  logger.info('Uploaded voting engagement results', { outputKey });

  return {
    outputs: {
      voting_engagement: outputKey,
    },
  };
}
