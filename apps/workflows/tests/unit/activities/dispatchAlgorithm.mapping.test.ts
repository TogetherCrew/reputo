import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockComputeContributionScore,
  mockComputeProposalEngagement,
  mockComputeVotingEngagement,
  mockComputeTokenValueOverTime,
} = vi.hoisted(() => ({
  mockComputeContributionScore: vi.fn(),
  mockComputeProposalEngagement: vi.fn(),
  mockComputeVotingEngagement: vi.fn(),
  mockComputeTokenValueOverTime: vi.fn(),
}));

vi.mock('../../../src/activities/typescript/algorithms/contribution-score/compute.js', () => ({
  computeContributionScore: mockComputeContributionScore,
}));

vi.mock('../../../src/activities/typescript/algorithms/proposal-engagement/compute.js', () => ({
  computeProposalEngagement: mockComputeProposalEngagement,
}));

vi.mock('../../../src/activities/typescript/algorithms/voting-engagement/compute.js', () => ({
  computeVotingEngagement: mockComputeVotingEngagement,
}));

vi.mock('../../../src/activities/typescript/algorithms/token-value-over-time/compute.js', () => ({
  computeTokenValueOverTime: mockComputeTokenValueOverTime,
}));

import { dispatchAlgorithm } from '../../../src/activities/typescript/dispatchAlgorithm.activity.js';

describe('dispatchAlgorithm mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockComputeTokenValueOverTime.mockResolvedValue({
      outputs: {
        token_value_over_time: 'outputs/token.csv',
        token_value_over_time_details: 'outputs/token-details.json',
      },
    });
  });

  it('routes token_value_over_time snapshots to computeTokenValueOverTime', async () => {
    const run = dispatchAlgorithm({} as never);

    const snapshot = {
      _id: 'snapshot-1',
      algorithmPresetFrozen: {
        key: 'token_value_over_time',
        version: '1.0.0',
        inputs: [],
      },
    };

    const result = await run(snapshot as never);

    expect(mockComputeTokenValueOverTime).toHaveBeenCalledOnce();
    expect(result).toEqual({
      outputs: {
        token_value_over_time: 'outputs/token.csv',
        token_value_over_time_details: 'outputs/token-details.json',
      },
    });
  });
});
