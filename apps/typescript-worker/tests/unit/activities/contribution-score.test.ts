import type { Storage } from '@reputo/storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contribution_score } from '../../../src/activities/contribution_score.activity.js';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../../../src/types/algorithm.js';

// Mock filesystem I/O used for temp DB writes
vi.mock('node:fs/promises', () => ({
  mkdtemp: vi.fn(async () => '/tmp/reputo-test-deepfundingdb'),
  writeFile: vi.fn(async () => undefined),
  rm: vi.fn(async () => undefined),
}));

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

// Mock the deepfunding-portal-api module
vi.mock('@reputo/deepfunding-portal-api', () => ({
  initializeDb: vi.fn(),
  closeDb: vi.fn(),
  commentsRepo: {
    findAll: vi.fn(),
  },
  commentVotesRepo: {
    findAll: vi.fn(),
  },
  proposalsRepo: {
    findAll: vi.fn(),
  },
  usersRepo: {
    findAll: vi.fn(),
  },
}));

// Create mock storage object
const mockStorage = {
  getObject: vi.fn(),
  putObject: vi.fn(),
};

// Import mocked modules
import { closeDb, commentsRepo, commentVotesRepo, proposalsRepo, usersRepo } from '@reputo/deepfunding-portal-api';

/**
 * Create test payload with algorithm parameters
 */
function createTestPayload(overrides: Partial<WorkerAlgorithmPayload> = {}): WorkerAlgorithmPayload {
  return {
    snapshotId: 'test-snapshot-123',
    algorithmKey: 'contribution_score',
    algorithmVersion: '1.0.0',
    inputLocations: [
      { key: 'comment_base_score', value: '10' },
      { key: 'comment_upvote_weight', value: '2' },
      { key: 'comment_downvote_weight', value: '3' },
      { key: 'self_interaction_penalty_factor', value: '0.5' },
      { key: 'project_owner_upvote_bonus_multiplier', value: '1.2' },
      { key: 'engagement_window_months', value: '12' },
      { key: 'monthly_decay_rate_percent', value: '10' },
      { key: 'decay_bucket_size_months', value: '1' },
      {
        key: 'deepfunding_db_key',
        value: 'snapshots/test-snapshot-123/deepfunding.db',
      },
    ],
    ...overrides,
  };
}

/**
 * Create mock comment data
 */
function createMockComment(
  overrides: {
    commentId?: number;
    userId?: number;
    proposalId?: number;
    parentId?: number;
    isReply?: boolean;
    createdAt?: string;
  } = {},
) {
  const now = new Date();
  return {
    commentId: overrides.commentId ?? 1,
    parentId: overrides.parentId ?? 0,
    isReply: overrides.isReply ?? false,
    userId: overrides.userId ?? 100,
    proposalId: overrides.proposalId ?? 1,
    content: 'Test comment',
    commentVotes: '0',
    createdAt: overrides.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    rawJson: '{}',
  };
}

/**
 * Create mock comment vote data
 */
function createMockVote(overrides: { voterId?: number; commentId?: number; voteType?: 'upvote' | 'downvote' } = {}) {
  return {
    voterId: overrides.voterId ?? 200,
    commentId: overrides.commentId ?? 1,
    voteType: overrides.voteType ?? 'upvote',
    createdAt: new Date().toISOString(),
    rawJson: '{}',
  };
}

/**
 * Create mock proposal data
 */
function createMockProposal(overrides: { id?: number; proposerId?: number; teamMembers?: number[] } = {}) {
  return {
    id: overrides.id ?? 1,
    roundId: 1,
    poolId: 1,
    proposerId: overrides.proposerId ?? 100,
    title: 'Test Proposal',
    content: 'Test content',
    link: 'https://example.com',
    featureImage: '',
    requestedAmount: '1000',
    awardedAmount: '0',
    isAwarded: false,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    teamMembers: JSON.stringify(overrides.teamMembers ?? []),
    rawJson: '{}',
  };
}

/**
 * Create mock user data
 */
function createMockUser(overrides: { id?: number; collectionId?: string } = {}) {
  return {
    id: overrides.id ?? 100,
    collectionId: overrides.collectionId ?? 'user-100',
    userName: 'Test User',
    email: 'test@example.com',
    totalProposals: 1,
    rawJson: '{}',
  };
}

describe('contribution_score activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up global storage mock before each test
    global.storage = mockStorage as unknown as Storage;
    vi.mocked(mockStorage.putObject).mockResolvedValue(undefined);
    vi.mocked(mockStorage.getObject).mockResolvedValue(Buffer.from('sqlite'));
  });

  it('should compute basic contribution score correctly', async () => {
    // Simple case: one user with one comment, no votes
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 200 }), // Different proposer, so user 100 is not related
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    const result: WorkerAlgorithmResult = await contribution_score(payload);

    // Verify storage operations
    expect(mockStorage.putObject).toHaveBeenCalledWith(
      'snapshots/test-snapshot-123/contribution_score.csv',
      expect.stringContaining('collection_id,contribution_score'),
      'text/csv',
    );
    expect(mockStorage.putObject).toHaveBeenCalledWith(
      'snapshots/test-snapshot-123/contribution_score_details.json',
      expect.stringContaining('"comments"'),
      'application/json',
    );

    // Verify result structure
    expect(result).toEqual({
      outputs: {
        contribution_score: 'snapshots/test-snapshot-123/contribution_score.csv',
        contribution_score_details: 'snapshots/test-snapshot-123/contribution_score_details.json',
      },
    });

    // Verify the output CSV content
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('collection_id,contribution_score');
    expect(outputCsv).toContain('user-100');

    // Score should be: 1 (time weight) * 1 (no penalty) * 10 (base) = 10
    expect(outputCsv).toContain('10');
  });

  it('should apply upvote and downvote weights correctly', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([
      createMockVote({ voterId: 200, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 201, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 202, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 203, commentId: 1, voteType: 'upvote' }),
      createMockVote({
        voterId: 204,
        commentId: 1,
        voteType: 'downvote',
      }),
      createMockVote({
        voterId: 205,
        commentId: 1,
        voteType: 'downvote',
      }),
    ]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([createMockProposal({ id: 1, proposerId: 300 })]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    const result = await contribution_score(payload);

    // Base = 10 + 4*2 - 2*3 = 10 + 8 - 6 = 12
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,12');
    expect(result.outputs.contribution_score).toBe('snapshots/test-snapshot-123/contribution_score.csv');
  });

  it('should apply self-interaction penalty for related project', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 100 }), // User 100 is the proposer
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Score should be: 1 (time weight) * 0.5 (penalty for related) * 10 (base) = 5
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,5');
  });

  it('should apply self-interaction penalty for same-author reply', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 2,
        userId: 100,
        proposalId: 1,
        parentId: 1,
        isReply: true,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 200 }), // Not the author
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Comment 1: 10 (no penalty)
    // Comment 2: 10 * 0.5 = 5 (self-reply penalty)
    // Total: 15
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,15');
  });

  it('should apply double penalty for related project AND same-author reply', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 2,
        userId: 100,
        proposalId: 1,
        parentId: 1,
        isReply: true,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 100 }), // User is proposer
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Comment 1: 10 * 0.5 = 5 (related penalty)
    // Comment 2: 10 * 0.5^2 = 2.5 (related + self-reply penalty)
    // Total: 7.5
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,7.5');
  });

  it('should apply project owner upvote bonus', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([
      createMockVote({ voterId: 200, commentId: 1, voteType: 'upvote' }), // Project owner upvotes
    ]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 200 }), // User 200 is proposer
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Base = 10 + 1*2 = 12
    // Score = 1.2 (owner bonus) * 1 (time) * 1 (no penalty) * 12 = 14.4
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    // Handle floating point precision by checking the parsed value
    const lines = outputCsv.trim().split('\n');
    const dataLine = lines[1];
    const score = Number.parseFloat(dataLine.split(',')[1]);
    expect(score).toBeCloseTo(14.4, 5);
  });

  it('should apply time decay correctly', async () => {
    // Create a comment that is 2 months old (bucket 2 → Tw = 0.8)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 75); // ~2.5 months ago

    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: twoMonthsAgo.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([createMockProposal({ id: 1, proposerId: 200 })]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Score should be: ~0.8 (time weight for ~2.5 months) * 1 * 10 = ~8
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    // Parse the score from CSV
    const lines = outputCsv.trim().split('\n');
    const dataLine = lines[1];
    const score = Number.parseFloat(dataLine.split(',')[1]);
    // With decay_bucket_size_months=1 and monthly_decay_rate_percent=10
    // 75 days ≈ 2.46 months → bucket 2 → Tw = 1 - 2*0.1 = 0.8
    expect(score).toBeCloseTo(8, 0);
  });

  it('should exclude comments outside engagement window', async () => {
    // Create a comment that is 13 months old (outside 12-month window)
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setDate(thirteenMonthsAgo.getDate() - 395);

    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: thirteenMonthsAgo.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([createMockProposal({ id: 1, proposerId: 200 })]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // User should have no score since comment is outside window
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    const lines = outputCsv.trim().split('\n');
    expect(lines.length).toBe(1); // Only header, no data rows
  });

  it('should handle the example from the spec', async () => {
    // Create a comment that is 45 days old (bucket 1 → Tw = 0.9)
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: fortyFiveDaysAgo.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([
      // 4 upvotes
      createMockVote({ voterId: 200, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 201, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 202, commentId: 1, voteType: 'upvote' }),
      createMockVote({ voterId: 203, commentId: 1, voteType: 'upvote' }),
      // 2 downvotes
      createMockVote({
        voterId: 204,
        commentId: 1,
        voteType: 'downvote',
      }),
      createMockVote({
        voterId: 205,
        commentId: 1,
        voteType: 'downvote',
      }),
    ]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 100 }), // User is related (proposer)
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([
      createMockUser({ id: 100, collectionId: 'user-100' }),
      createMockUser({ id: 200, collectionId: 'owner-200' }),
    ]);

    // Add owner upvote (user 200 is actually user 100 in this test setup)
    // Let me fix the test: user 100 is the proposer, and 200 upvotes
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 100, teamMembers: [200] }), // User 100 is proposer, 200 is team member
    ]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // From spec example:
    // Base = 10 + 4*2 - 2*3 = 12
    // k = 1 (related project only, no self-reply)
    // Tw = 0.9 (45 days → bucket 1)
    // owner_bonus = 1.2 (team member 200 upvoted)
    // Score = 1.2 * 0.9 * 0.5 * 12 = 6.48
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    const lines = outputCsv.trim().split('\n');
    const dataLine = lines[1];
    const score = Number.parseFloat(dataLine.split(',')[1]);
    expect(score).toBeCloseTo(6.48, 1);
  });

  it('should aggregate scores for multiple comments by same user', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 2,
        userId: 100,
        proposalId: 2,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 3,
        userId: 100,
        proposalId: 3,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({ id: 1, proposerId: 200 }),
      createMockProposal({ id: 2, proposerId: 200 }),
      createMockProposal({ id: 3, proposerId: 200 }),
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Each comment: 10 points
    // Total: 30 points
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,30');
  });

  it('should handle multiple users correctly', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 2,
        userId: 101,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
      createMockComment({
        commentId: 3,
        userId: 102,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([createMockProposal({ id: 1, proposerId: 200 })]);
    vi.mocked(usersRepo.findAll).mockReturnValue([
      createMockUser({ id: 100, collectionId: 'user-100' }),
      createMockUser({ id: 101, collectionId: 'user-101' }),
      createMockUser({ id: 102, collectionId: 'user-102' }),
    ]);

    const payload = createTestPayload();
    await contribution_score(payload);

    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,10');
    expect(outputCsv).toContain('user-101,10');
    expect(outputCsv).toContain('user-102,10');
  });

  it('should throw error when storage is not initialized', async () => {
    global.storage = undefined;

    const payload = createTestPayload();
    await expect(contribution_score(payload)).rejects.toThrow('Storage instance not initialized');
  });

  it('should throw error when deepfunding_db_key is missing', async () => {
    const payload = createTestPayload({
      inputLocations: [
        { key: 'comment_base_score', value: '10' },
        { key: 'comment_upvote_weight', value: '2' },
        { key: 'comment_downvote_weight', value: '3' },
        { key: 'self_interaction_penalty_factor', value: '0.5' },
        { key: 'project_owner_upvote_bonus_multiplier', value: '1.2' },
        { key: 'engagement_window_months', value: '12' },
        { key: 'monthly_decay_rate_percent', value: '10' },
        // Missing deepfunding_db_key
      ],
    });

    await expect(contribution_score(payload)).rejects.toThrow('Missing input "deepfunding_db_key"');
  });

  it('should close database connection even on error', async () => {
    vi.mocked(commentsRepo.findAll).mockImplementation(() => {
      throw new Error('Database error');
    });

    const payload = createTestPayload();
    await expect(contribution_score(payload)).rejects.toThrow('Database error');

    // Verify closeDb was called
    expect(closeDb).toHaveBeenCalled();
  });

  it('should handle team members as related to proposal', async () => {
    const now = new Date();
    vi.mocked(commentsRepo.findAll).mockReturnValue([
      createMockComment({
        commentId: 1,
        userId: 100,
        proposalId: 1,
        createdAt: now.toISOString(),
      }),
    ]);
    vi.mocked(commentVotesRepo.findAll).mockReturnValue([]);
    vi.mocked(proposalsRepo.findAll).mockReturnValue([
      createMockProposal({
        id: 1,
        proposerId: 200,
        teamMembers: [100, 101],
      }), // User 100 is team member
    ]);
    vi.mocked(usersRepo.findAll).mockReturnValue([createMockUser({ id: 100, collectionId: 'user-100' })]);

    const payload = createTestPayload();
    await contribution_score(payload);

    // Score should have penalty: 10 * 0.5 = 5
    const outputCsv = vi.mocked(mockStorage.putObject).mock.calls[0][1] as string;
    expect(outputCsv).toContain('user-100,5');
  });
});
