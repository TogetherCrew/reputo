import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';

import config from '../../../../config/index.js';
import { HEARTBEAT_INTERVAL } from '../../../../shared/constants/index.js';
import type { AlgorithmResult, Snapshot } from '../../../../shared/types/index.js';
import { stringifyCsvAsync } from '../../../../shared/utils/index.js';
import { buildVoterBenchmarkRecord, formatBenchmarkOutput } from './benchmark/index.js';
import { calculateVotingEngagement, groupVotesByVoter } from './pipeline/index.js';
import type { VoterBenchmarkRecord, VotingEngagementResult } from './types.js';
import { roundScore } from './types.js';
import { extractVotesKey, loadVotes } from './utils/index.js';

/**
 * Computes voting engagement scores.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeVotingEngagement(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const ctx = Context.current();
  const logger = ctx.log;
  const snapshotId = snapshot._id;

  logger.info('Starting voting_engagement algorithm', { snapshotId });

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
  const benchmarkRecords: VoterBenchmarkRecord[] = [];

  let processed = 0;
  for (const [voterId, voterVotes] of votesByVoter.entries()) {
    if (processed % HEARTBEAT_INTERVAL === 0) {
      ctx.heartbeat({ phase: 'scoring', processed, total: votesByVoter.size });
    }
    processed++;

    const votingEngagement = roundScore(calculateVotingEngagement(voterVotes));

    results.push({
      collection_id: voterId,
      voting_engagement: votingEngagement,
    });

    benchmarkRecords.push(buildVoterBenchmarkRecord(voterId, voterVotes, votingEngagement));
  }

  // Sort by collection_id for deterministic output
  results.sort((a, b) => a.collection_id.localeCompare(b.collection_id));

  logger.info('Computed voting engagement scores', {
    resultCount: results.length,
  });

  ctx.heartbeat({ phase: 'upload' });

  // Generate and upload CSV output (async to avoid blocking the event loop)
  const csvContent = await stringifyCsvAsync(results, {
    header: true,
    columns: ['collection_id', 'voting_engagement'],
  });

  const outputKey = generateKey('snapshot', snapshotId, `${snapshot.algorithmPresetFrozen.key}.csv`);

  await storage.putObject({
    bucket,
    key: outputKey,
    body: csvContent,
    contentType: 'text/csv',
  });

  logger.info('Uploaded voting engagement results', { outputKey });

  // Generate and upload benchmark details
  const benchmark = formatBenchmarkOutput({
    records: benchmarkRecords,
    snapshotId,
    stats,
  });

  const benchmarkKey = generateKey('snapshot', snapshotId, 'voting_engagement_details.json');

  await storage.putObject({
    bucket,
    key: benchmarkKey,
    body: JSON.stringify(benchmark, null, 2),
    contentType: 'application/json',
  });

  logger.info('Uploaded voting engagement benchmark', { benchmarkKey });

  return {
    outputs: {
      voting_engagement: outputKey,
      voting_engagement_details: benchmarkKey,
    },
  };
}
