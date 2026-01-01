import type { Storage } from '@reputo/storage';
import { ObjectNotFoundError } from '@reputo/storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock filesystem I/O used for temp DB file
vi.mock('node:fs/promises', () => ({
  mkdtemp: vi.fn(async () => '/tmp/reputo-test-deepfunding-sync'),
  readFile: vi.fn(async () => Buffer.from('sqlite-bytes')),
  rm: vi.fn(async () => undefined),
}));

// Mock deepfunding-portal-api package
vi.mock('@reputo/deepfunding-portal-api', () => ({
  initializeDb: vi.fn(),
  closeDb: vi.fn(),
  createDeepFundingClient: vi.fn(() => ({ config: {}, limiter: {}, get: vi.fn() })),
  fetchRounds: vi.fn(async () => [{ id: 1 }]),
  fetchProposals: vi.fn(async () => [{ id: 10 }]),
  fetchPools: vi.fn(async () => [{ id: 100 }]),
  fetchMilestones: vi.fn(async function* () {
    yield { pagination: { current_page: 1 }, data: [{ id: 200 }] };
  }),
  fetchReviews: vi.fn(async function* () {
    yield { pagination: { current_page: 1 }, data: [{ review_id: 300 }] };
  }),
  fetchComments: vi.fn(async function* () {
    yield { pagination: { current_page: 1 }, data: [{ comment_id: 400 }] };
  }),
  fetchCommentVotes: vi.fn(async function* () {
    yield { pagination: { current_page: 1 }, data: [{ voter_id: 500, comment_id: 400 }] };
  }),
  fetchUsers: vi.fn(async function* () {
    yield { pagination: { current_page: 1 }, data: [{ id: 600 }] };
  }),
  roundsRepo: { createMany: vi.fn() },
  proposalsRepo: { createMany: vi.fn() },
  poolsRepo: { createMany: vi.fn() },
  milestonesRepo: { createMany: vi.fn() },
  reviewsRepo: { createMany: vi.fn() },
  commentsRepo: { createMany: vi.fn() },
  commentVotesRepo: { createMany: vi.fn() },
  usersRepo: { createMany: vi.fn() },
}));

import { deepfunding_sync } from '../../../src/activities/deepfunding_sync.activity.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

const mockStorage = {
  verify: vi.fn(),
  putObject: vi.fn(),
} as unknown as Storage;

describe('deepfunding_sync activity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.storage = mockStorage;

    process.env.DEEPFUNDING_API_BASE_URL = 'https://example.com/api';
    process.env.DEEPFUNDING_API_KEY = 'test-api-key';
  });

  it('should be idempotent when deepfunding.db already exists', async () => {
    (mockStorage as any).verify = vi.fn(async () => ({
      key: 'snapshots/s1/deepfunding.db',
      metadata: { filename: 'deepfunding.db', ext: 'db', size: 1, contentType: 'application/x-sqlite3', timestamp: 0 },
    }));

    const result = await deepfunding_sync({ snapshotId: 's1' });

    expect(result.outputs).toEqual({
      deepfunding_db_key: 'snapshots/s1/deepfunding.db',
      deepfunding_manifest_key: 'snapshots/s1/deepfunding/manifest.json',
    });
    expect((mockStorage as any).putObject).not.toHaveBeenCalled();
  });

  it('should sync and upload db + manifest when missing', async () => {
    (mockStorage as any).verify = vi.fn(async () => {
      throw new ObjectNotFoundError('snapshots/s2/deepfunding.db');
    });
    (mockStorage as any).putObject = vi.fn(async () => undefined);

    const result = await deepfunding_sync({ snapshotId: 's2' });

    expect(result.outputs.deepfunding_db_key).toBe('snapshots/s2/deepfunding.db');
    expect(result.outputs.deepfunding_manifest_key).toBe('snapshots/s2/deepfunding/manifest.json');

    // uploads: at least db + manifest + some raw json
    expect((mockStorage as any).putObject).toHaveBeenCalledWith(
      'snapshots/s2/deepfunding.db',
      expect.any(Buffer),
      'application/x-sqlite3',
    );
    expect((mockStorage as any).putObject).toHaveBeenCalledWith(
      'snapshots/s2/deepfunding/manifest.json',
      expect.any(String),
      'application/json',
    );
  });
});
