import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDeepFundingDb, createNewDeepFundingDb } from '../../src/db/client.js';
import * as schema from '../../src/db/schema.js';
import {
  commentsRepo,
  commentVotesRepo,
  milestonesRepo,
  poolsRepo,
  proposalsRepo,
  reviewsRepo,
  roundsRepo,
  usersRepo,
} from '../../src/resources/index.js';
import * as proposalsSchema from '../../src/resources/proposals/schema.js';
import * as roundsSchema from '../../src/resources/rounds/schema.js';
import type { DeepFundingPortalDb } from '../../src/shared/types/db.js';

describe('Database bootstrap', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deepfunding-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create a new database', () => {
    const dbPath = path.join(tempDir, 'test.db');
    const db = createNewDeepFundingDb({ path: dbPath });

    expect(fs.existsSync(dbPath)).toBe(true);
    expect(db.sqlite).toBeDefined();
    expect(db.drizzle).toBeDefined();

    closeDeepFundingDb(db);
  });
});

describe('Repository functions', () => {
  let tempDir: string;
  let db: DeepFundingPortalDb;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deepfunding-ingest-'));
    const dbPath = path.join(tempDir, 'test.db');
    db = createNewDeepFundingDb({ path: dbPath });
  });

  afterEach(() => {
    closeDeepFundingDb(db);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('roundsRepo.create', () => {
    it('should insert rounds with pool_ids array', () => {
      const round = {
        id: 1,
        name: 'Round 1',
        slug: 'round-1',
        description: 'First round',
        pool_id: [{ id: 10 }, { id: 20 }],
      };

      roundsRepo.create(db, round);

      const insertedRounds = db.drizzle.select().from(roundsSchema.rounds).all();
      expect(insertedRounds).toHaveLength(1);
      expect(insertedRounds[0].name).toBe('Round 1');
      expect(JSON.parse(insertedRounds[0].poolIds)).toEqual([10, 20]);
    });
  });

  describe('poolsRepo.create', () => {
    it('should insert pools', () => {
      const pool = {
        id: 10,
        name: 'Pool A',
        slug: 'pool-a',
        max_funding_amount: '100,000',
        description: 'Pool description',
      };

      poolsRepo.create(db, pool);

      const insertedPools = db.drizzle.select().from(schema.pools).all();
      expect(insertedPools).toHaveLength(1);
      expect(insertedPools[0].maxFundingAmount).toBe('100,000');
    });
  });

  describe('proposalsRepo.create', () => {
    it('should insert proposals with team_members array', () => {
      const proposal = {
        id: 100,
        pool_id: 10,
        proposer_id: '5',
        team_members: [5, 6, 7],
        title: 'Proposal Title',
        content: 'Proposal content',
        link: 'https://example.com',
        feature_image: 'https://example.com/image.png',
        requested_amount: '50000',
        awarded_amount: '0',
        is_awarded: false,
        is_completed: false,
        created_at: '2024-01-01 00:00:00',
        round_id: 1,
      };

      proposalsRepo.create(db, proposal);

      const insertedProposals = db.drizzle.select().from(proposalsSchema.proposals).all();
      expect(insertedProposals).toHaveLength(1);
      expect(insertedProposals[0].roundId).toBe(1);
      expect(JSON.parse(insertedProposals[0].teamMembers)).toEqual([5, 6, 7]);
    });
  });

  describe('usersRepo.create', () => {
    it('should insert users', () => {
      const user = {
        id: 5,
        collection_id: 'COL123',
        user_name: 'John Doe',
        email: 'john@example.com',
        total_proposals: 3,
      };

      usersRepo.create(db, user);

      const insertedUsers = db.drizzle.select().from(schema.users).all();
      expect(insertedUsers).toHaveLength(1);
      expect(insertedUsers[0].userName).toBe('John Doe');
    });
  });

  describe('milestonesRepo.create', () => {
    it('should insert milestones', () => {
      const milestone = {
        id: '500',
        proposal_id: 100,
        title: 'Milestone 1',
        status: 'pending' as const,
        description: 'Description',
        development_description: 'Dev description',
        budget: '10000',
        created_at: '',
        updated_at: '',
      };

      milestonesRepo.create(db, milestone);

      const insertedMilestones = db.drizzle.select().from(schema.milestones).all();
      expect(insertedMilestones).toHaveLength(1);
      expect(insertedMilestones[0].id).toBe('500');
    });
  });

  describe('reviewsRepo.create', () => {
    it('should insert reviews', () => {
      const review = {
        review_id: 'R1',
        proposal_id: 100,
        reviewer_id: 5,
        review_type: 'community' as const,
        overall_rating: '4.5',
        feasibility_rating: '4.0',
        viability_rating: '4.2',
        desirability_rating: '4.8',
        usefulness_rating: '4.3',
        created_at: '2024-01-01 00:00:00',
      };

      reviewsRepo.create(db, review);

      const insertedReviews = db.drizzle.select().from(schema.reviews).all();
      expect(insertedReviews).toHaveLength(1);
      expect(insertedReviews[0].overallRating).toBe('4.5');
    });
  });

  describe('commentsRepo.create', () => {
    it('should insert comments', () => {
      const comment = {
        comment_id: 'C1',
        parent_id: '0',
        is_reply: false,
        user_id: '5',
        proposal_id: '100',
        content: 'Great proposal!',
        comment_votes: '10',
        created_at: '2024-01-01 00:00:00',
        updated_at: '2024-01-01 00:00:00',
      };

      commentsRepo.create(db, comment);

      const insertedComments = db.drizzle.select().from(schema.comments).all();
      expect(insertedComments).toHaveLength(1);
      expect(insertedComments[0].content).toBe('Great proposal!');
    });
  });

  describe('commentVotesRepo.create', () => {
    it('should insert comment votes', () => {
      const vote = {
        voter_id: 5,
        comment_id: 'C1',
        vote_type: 'upvote' as const,
        created_at: '2024-01-01 00:00:00',
      };

      commentVotesRepo.create(db, vote);

      const insertedVotes = db.drizzle.select().from(schema.commentVotes).all();
      expect(insertedVotes).toHaveLength(1);
      expect(insertedVotes[0].voteType).toBe('upvote');
    });
  });
});
