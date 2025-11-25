import { beforeEach, describe, expect, it, vi } from 'vitest';
import { voting_engagement } from '../../../src/activities/voting-engagement.activity.js';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../../../src/types/algorithm.js';

// Mock the storage module
vi.mock('../../../src/storage.js', () => ({
  storage: {
    getObject: vi.fn(),
    putObject: vi.fn(),
  },
}));

// Mock the logger module
vi.mock('../../../src/config/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

// Import mocked storage after setting up the mock
const { storage } = await import('../../../src/storage.js');

describe('voting_engagement activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute voting engagement scores correctly', async () => {
    const inputCsv = `collection_id,voter_id,timestamp
col1,voter1,2024-01-01T00:00:00Z
col1,voter2,2024-01-01T01:00:00Z
col2,voter1,2024-01-01T02:00:00Z
col2,voter3,2024-01-01T03:00:00Z`;

    vi.mocked(storage.getObject).mockResolvedValue(Buffer.from(inputCsv));
    vi.mocked(storage.putObject).mockResolvedValue(undefined);

    const payload: WorkerAlgorithmPayload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }],
    };

    const result: WorkerAlgorithmResult = await voting_engagement(payload);

    // Verify storage operations
    expect(storage.getObject).toHaveBeenCalledWith('snapshots/123/inputs/votes.csv');
    expect(storage.putObject).toHaveBeenCalledWith(
      'snapshots/test-snapshot-123/outputs/voting_engagement.csv',
      expect.stringContaining('collection_id,voting_engagement'),
      'text/csv',
    );

    // Verify result structure
    expect(result).toEqual({
      outputs: {
        voting_engagement: 'snapshots/test-snapshot-123/outputs/voting_engagement.csv',
      },
    });

    // Verify the output CSV content
    const outputCsv = vi.mocked(storage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('collection_id,voting_engagement');
    expect(outputCsv).toContain('col1');
    expect(outputCsv).toContain('col2');
  });

  it('should throw an error if votes input is missing', async () => {
    const payload: WorkerAlgorithmPayload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [],
    };

    await expect(voting_engagement(payload)).rejects.toThrow('Missing input "votes"');
  });

  it('should handle storage errors gracefully', async () => {
    vi.mocked(storage.getObject).mockRejectedValue(new Error('S3 connection failed'));

    const payload: WorkerAlgorithmPayload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }],
    };

    await expect(voting_engagement(payload)).rejects.toThrow('S3 connection failed');
  });
});
