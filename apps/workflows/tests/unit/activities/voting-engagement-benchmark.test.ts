import { describe, expect, it } from 'vitest';
import {
  buildVoterBenchmarkRecord,
  formatBenchmarkOutput,
} from '../../../src/activities/typescript/algorithms/voting-engagement/benchmark/index.js';
import type { VoteGroupingStats } from '../../../src/activities/typescript/algorithms/voting-engagement/pipeline/vote-grouping.js';
import type {
  ValidVote,
  VoterBenchmarkRecord,
} from '../../../src/activities/typescript/algorithms/voting-engagement/types.js';
import { MAX_VOTING_ENTROPY } from '../../../src/activities/typescript/algorithms/voting-engagement/types.js';

describe('voting-engagement benchmark', () => {
  describe('buildVoterBenchmarkRecord', () => {
    it('builds a record with correct vote distribution', () => {
      const votes: ValidVote[] = ['1', '5', '5', '10', 'skip'];
      const engagement = 0.636514;

      const record = buildVoterBenchmarkRecord('voter-abc', votes, engagement);

      expect(record.collection_id).toBe('voter-abc');
      expect(record.total_votes).toBe(5);
      expect(record.vote_distribution.skip).toBe(1);
      expect(record.vote_distribution['1']).toBe(1);
      expect(record.vote_distribution['5']).toBe(2);
      expect(record.vote_distribution['10']).toBe(1);
      // Unused categories should be zero
      expect(record.vote_distribution['2']).toBe(0);
      expect(record.vote_distribution['3']).toBe(0);
      expect(record.voting_engagement).toBe(0.636514);
    });

    it('computes raw Shannon entropy and rounds it', () => {
      // Uniform distribution across all 11 categories → max entropy
      const votes: ValidVote[] = ['skip', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const engagement = 1.0;

      const record = buildVoterBenchmarkRecord('voter-uniform', votes, engagement);

      // With uniform distribution, entropy should equal MAX_VOTING_ENTROPY
      expect(record.entropy).toBeCloseTo(MAX_VOTING_ENTROPY, 5);
      expect(record.voting_engagement).toBe(1.0);
    });

    it('returns zero entropy for a single-category voter', () => {
      const votes: ValidVote[] = ['5', '5', '5'];
      const engagement = 0;

      const record = buildVoterBenchmarkRecord('voter-mono', votes, engagement);

      expect(record.entropy).toBe(0);
      expect(record.total_votes).toBe(3);
      expect(record.vote_distribution['5']).toBe(3);
    });

    it('handles empty votes array', () => {
      const record = buildVoterBenchmarkRecord('voter-empty', [], 0);

      expect(record.total_votes).toBe(0);
      expect(record.entropy).toBe(0);
      expect(record.voting_engagement).toBe(0);
    });
  });

  describe('formatBenchmarkOutput', () => {
    const baseStats: VoteGroupingStats = {
      totalVotes: 100,
      validVotes: 95,
      invalidVotes: 5,
      uniqueVoters: 3,
    };

    const baseRecord: VoterBenchmarkRecord = {
      collection_id: '',
      total_votes: 0,
      vote_distribution: {
        skip: 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '10': 0,
      },
      entropy: 0,
      voting_engagement: 0,
    };

    it('includes metadata with processing stats', () => {
      const records: VoterBenchmarkRecord[] = [
        { ...baseRecord, collection_id: 'voter-a', total_votes: 50, voting_engagement: 0.85 },
        { ...baseRecord, collection_id: 'voter-b', total_votes: 30, voting_engagement: 0.62 },
      ];

      const result = formatBenchmarkOutput({
        records,
        snapshotId: 'snap-123',
        stats: baseStats,
      });

      expect(result.voters).toHaveLength(2);
      expect(result.metadata.snapshot_id).toBe('snap-123');
      expect(result.metadata.metrics.total_votes_in_file).toBe(100);
      expect(result.metadata.metrics.valid_votes).toBe(95);
      expect(result.metadata.metrics.invalid_votes).toBe(5);
      expect(result.metadata.metrics.unique_voters).toBe(3);
    });

    it('sorts voters by collection_id', () => {
      const records: VoterBenchmarkRecord[] = [
        { ...baseRecord, collection_id: 'voter-z' },
        { ...baseRecord, collection_id: 'voter-a' },
        { ...baseRecord, collection_id: 'voter-m' },
      ];

      const result = formatBenchmarkOutput({
        records,
        snapshotId: 'snap-sort',
        stats: baseStats,
      });

      const [first, second, third] = result.voters;
      expect(first?.collection_id).toBe('voter-a');
      expect(second?.collection_id).toBe('voter-m');
      expect(third?.collection_id).toBe('voter-z');
    });

    it('handles empty records array', () => {
      const emptyStats: VoteGroupingStats = {
        totalVotes: 0,
        validVotes: 0,
        invalidVotes: 0,
        uniqueVoters: 0,
      };

      const result = formatBenchmarkOutput({
        records: [],
        snapshotId: 'snap-empty',
        stats: emptyStats,
      });

      expect(result.voters).toHaveLength(0);
      expect(result.metadata.metrics.unique_voters).toBe(0);
    });

    it('does not mutate the original records array', () => {
      const records: VoterBenchmarkRecord[] = [
        { ...baseRecord, collection_id: 'voter-b' },
        { ...baseRecord, collection_id: 'voter-a' },
      ];

      formatBenchmarkOutput({
        records,
        snapshotId: 'snap-immutable',
        stats: baseStats,
      });

      // Original order should be preserved
      expect(records[0]?.collection_id).toBe('voter-b');
      expect(records[1]?.collection_id).toBe('voter-a');
    });
  });
});
