import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockGenerateKey,
  mockStringifyCsvAsync,
  mockBuildVoterBenchmarkRecord,
  mockFormatBenchmarkOutput,
  mockCalculateVotingEngagement,
  mockGroupVotesByVoter,
  mockExtractVotesKey,
  mockLoadVotes,
  mockHeartbeat,
} = vi.hoisted(() => ({
  mockGenerateKey: vi.fn(),
  mockStringifyCsvAsync: vi.fn(),
  mockBuildVoterBenchmarkRecord: vi.fn(),
  mockFormatBenchmarkOutput: vi.fn(),
  mockCalculateVotingEngagement: vi.fn(),
  mockGroupVotesByVoter: vi.fn(),
  mockExtractVotesKey: vi.fn(),
  mockLoadVotes: vi.fn(),
  mockHeartbeat: vi.fn(),
}));

vi.mock('@reputo/storage', () => ({
  generateKey: mockGenerateKey,
}));

vi.mock('@temporalio/activity', () => ({
  Context: {
    current: () => ({
      log: {
        info: vi.fn(),
        debug: vi.fn(),
      },
      heartbeat: mockHeartbeat,
    }),
  },
}));

vi.mock('../../../src/shared/utils/index.js', () => ({
  stringifyCsvAsync: mockStringifyCsvAsync,
}));

vi.mock('../../../src/config/index.js', () => ({
  default: {
    storage: {
      bucket: 'test-bucket',
    },
  },
}));

vi.mock('../../../src/activities/typescript/algorithms/voting-engagement/benchmark/index.js', () => ({
  buildVoterBenchmarkRecord: mockBuildVoterBenchmarkRecord,
  formatBenchmarkOutput: mockFormatBenchmarkOutput,
}));

vi.mock('../../../src/activities/typescript/algorithms/voting-engagement/pipeline/index.js', () => ({
  calculateVotingEngagement: mockCalculateVotingEngagement,
  groupVotesByVoter: mockGroupVotesByVoter,
}));

vi.mock('../../../src/activities/typescript/algorithms/voting-engagement/utils/index.js', () => ({
  extractVotesKey: mockExtractVotesKey,
  loadVotes: mockLoadVotes,
}));

import { computeVotingEngagement } from '../../../src/activities/typescript/algorithms/voting-engagement/compute.js';

describe('computeVotingEngagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockExtractVotesKey.mockReturnValue('uploads/votes.csv');
    mockLoadVotes.mockResolvedValue([{ voter_id: 'voter-b' }, { voter_id: 'voter-a' }]);
    mockGroupVotesByVoter.mockReturnValue({
      votesByVoter: new Map([
        ['voter-b', ['1', '5']],
        ['voter-a', ['10']],
      ]),
      stats: {
        totalVotes: 3,
        validVotes: 3,
        invalidVotes: 0,
        uniqueVoters: 2,
      },
    });
    mockCalculateVotingEngagement.mockImplementation((votes: string[]) => votes.length / 10);
    mockBuildVoterBenchmarkRecord.mockImplementation((voterId: string, votes: string[], engagement: number) => ({
      collection_id: voterId,
      total_votes: votes.length,
      voting_engagement: engagement,
    }));
    mockFormatBenchmarkOutput.mockReturnValue({ voters: ['benchmark-output'] });
    mockStringifyCsvAsync.mockResolvedValue('collection_id,voting_engagement\nvoter-a,0.1');
    mockGenerateKey.mockReturnValueOnce('outputs/voting.csv').mockReturnValueOnce('outputs/voting-details.json');
  });

  it('sorts results, uploads both outputs, and emits progress heartbeats', async () => {
    const storage = {
      putObject: vi.fn().mockResolvedValue(undefined),
    };

    const result = await computeVotingEngagement(
      {
        _id: 'snapshot-1',
        algorithmPresetFrozen: {
          key: 'voting_engagement',
          inputs: [],
        },
      } as never,
      storage as never,
    );

    expect(mockExtractVotesKey).toHaveBeenCalledWith([]);
    expect(mockLoadVotes).toHaveBeenCalledWith(storage, expect.any(String), 'uploads/votes.csv');
    expect(mockStringifyCsvAsync).toHaveBeenCalledWith(
      [
        { collection_id: 'voter-a', voting_engagement: 0.1 },
        { collection_id: 'voter-b', voting_engagement: 0.2 },
      ],
      {
        header: true,
        columns: ['collection_id', 'voting_engagement'],
      },
    );
    expect(storage.putObject).toHaveBeenNthCalledWith(1, {
      bucket: 'test-bucket',
      key: 'outputs/voting.csv',
      body: 'collection_id,voting_engagement\nvoter-a,0.1',
      contentType: 'text/csv',
    });
    expect(storage.putObject).toHaveBeenNthCalledWith(2, {
      bucket: 'test-bucket',
      key: 'outputs/voting-details.json',
      body: JSON.stringify({ voters: ['benchmark-output'] }, null, 2),
      contentType: 'application/json',
    });
    expect(mockHeartbeat).toHaveBeenCalledWith({
      phase: 'scoring',
      processed: 0,
      total: 2,
    });
    expect(mockHeartbeat).toHaveBeenCalledWith({ phase: 'upload' });
    expect(result).toEqual({
      outputs: {
        voting_engagement: 'outputs/voting.csv',
        voting_engagement_details: 'outputs/voting-details.json',
      },
    });
  });
});
