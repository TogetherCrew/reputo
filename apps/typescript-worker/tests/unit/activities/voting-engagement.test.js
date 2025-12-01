import { beforeEach, describe, expect, it, vi } from 'vitest';
import { voting_engagement } from '../../../src/activities/voting-engagement.activity.js';

// Mock the logger module
vi.mock('../../../src/config/logger.js', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));
// Create mock storage object
const mockStorage = {
  getObject: vi.fn(),
  putObject: vi.fn(),
};
describe('voting_engagement activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up global storage mock before each test
    global.storage = mockStorage;
  });
  it('should compute voting engagement scores correctly', async () => {
    // Test CSV with proper column names matching the JSON schema
    const inputCsv = `collection_id,question_id,answer
voter1,proposal1,5
voter1,proposal2,7
voter2,proposal1,3
voter2,proposal3,skip
voter3,proposal1,10`;
    vi.mocked(mockStorage.getObject).mockResolvedValue(Buffer.from(inputCsv));
    vi.mocked(mockStorage.putObject).mockResolvedValue(undefined);
    const payload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }],
    };
    const result = await voting_engagement(payload);
    // Verify storage operations
    expect(mockStorage.getObject).toHaveBeenCalledWith('snapshots/123/inputs/votes.csv');
    expect(mockStorage.putObject).toHaveBeenCalledWith(
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
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1];
    expect(outputCsv).toContain('collection_id,voting_engagement');
    expect(outputCsv).toContain('voter1');
    expect(outputCsv).toContain('voter2');
    expect(outputCsv).toContain('voter3');
  });
  it('should throw an error if votes input is missing', async () => {
    const payload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [],
    };
    await expect(voting_engagement(payload)).rejects.toThrow('Missing input "votes"');
  });
  it('should handle storage errors gracefully', async () => {
    vi.mocked(mockStorage.getObject).mockRejectedValue(new Error('S3 connection failed'));
    const payload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }],
    };
    await expect(voting_engagement(payload)).rejects.toThrow('S3 connection failed');
  });
  it('should reject CSV with alias column names (only exact schema columns accepted)', async () => {
    // Test CSV using aliases: user_id (for collection_id), vote (for answer)
    // These should be ignored since aliases are not supported
    const inputCsv = `user_id,question_id,vote
voter1,proposal1,5
voter1,proposal2,7
voter2,proposal1,3`;
    vi.mocked(mockStorage.getObject).mockResolvedValue(Buffer.from(inputCsv));
    vi.mocked(mockStorage.putObject).mockResolvedValue(undefined);
    const payload = {
      snapshotId: 'test-snapshot-123',
      algorithmKey: 'voting_engagement',
      algorithmVersion: '1.0.0',
      inputLocations: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }],
    };
    const result = await voting_engagement(payload);
    // Verify the function completes successfully
    expect(result).toEqual({
      outputs: {
        voting_engagement: 'snapshots/test-snapshot-123/outputs/voting_engagement.csv',
      },
    });
    // Verify the output CSV contains header but no voter data
    // (since all rows were invalid due to missing collection_id and answer columns)
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1];
    expect(outputCsv).toContain('collection_id,voting_engagement');
    // Should only have header row, no data rows since aliases are not accepted
    const lines = outputCsv.trim().split('\n');
    expect(lines.length).toBe(1); // Only header row
  });
});
