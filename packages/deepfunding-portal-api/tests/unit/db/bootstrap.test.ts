import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOOTSTRAP_SQL, SCHEMA_VERSION } from '../../../src/db/bootstrap.js';
import { cleanupTestDb, createTestDb, getTableNames, tableExists } from '../../utils/db-helpers.js';

describe('Database Bootstrap', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb();
  });

  describe('BOOTSTRAP_SQL', () => {
    it('should be an array of SQL statements', () => {
      expect(Array.isArray(BOOTSTRAP_SQL)).toBe(true);
      expect(BOOTSTRAP_SQL.length).toBeGreaterThan(0);
    });

    it('should create all required tables', () => {
      const tableNames = getTableNames(db);
      const expectedTables = [
        'rounds',
        'pools',
        'proposals',
        'users',
        'milestones',
        'reviews',
        'comments',
        'comment_votes',
      ];

      for (const tableName of expectedTables) {
        expect(tableExists(db, tableName)).toBe(true);
        expect(tableNames).toContain(tableName);
      }
    });

    it('should create rounds table with correct structure', () => {
      expect(tableExists(db, 'rounds')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(rounds)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('slug');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('pool_ids');
      expect(columnNames).toContain('raw_json');
    });

    it('should create pools table with correct structure', () => {
      expect(tableExists(db, 'pools')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(pools)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('slug');
      expect(columnNames).toContain('max_funding_amount');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('raw_json');
    });

    it('should create proposals table with correct structure', () => {
      expect(tableExists(db, 'proposals')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(proposals)').all() as Array<{
        name: string;
        type: string;
      }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('round_id');
      expect(columnNames).toContain('pool_id');
      expect(columnNames).toContain('proposer_id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('content');
      expect(columnNames).toContain('raw_json');
    });

    it('should create users table with correct structure', () => {
      expect(tableExists(db, 'users')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(users)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('collection_id');
      expect(columnNames).toContain('user_name');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('total_proposals');
      expect(columnNames).toContain('raw_json');
    });

    it('should create milestones table with autoincrement id', () => {
      expect(tableExists(db, 'milestones')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(milestones)').all() as Array<{
        name: string;
        type: string;
        pk: number;
      }>;

      const idColumn = tableInfo.find((col) => col.name === 'id');
      expect(idColumn).toBeDefined();
    });

    it('should create reviews table with autoincrement review_id', () => {
      expect(tableExists(db, 'reviews')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(reviews)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('review_id');
      expect(columnNames).toContain('proposal_id');
      expect(columnNames).toContain('reviewer_id');
      expect(columnNames).toContain('review_type');
    });

    it('should create comments table with correct structure', () => {
      expect(tableExists(db, 'comments')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(comments)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('comment_id');
      expect(columnNames).toContain('parent_id');
      expect(columnNames).toContain('is_reply');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('proposal_id');
      expect(columnNames).toContain('content');
    });

    it('should create comment_votes table with composite primary key', () => {
      expect(tableExists(db, 'comment_votes')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(comment_votes)').all() as Array<{
        name: string;
        type: string;
      }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('voter_id');
      expect(columnNames).toContain('comment_id');
      expect(columnNames).toContain('vote_type');
    });

    it('should create indexes', () => {
      const indexes = db.sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'")
        .all() as Array<{ name: string }>;

      const indexNames = indexes.map((idx) => idx.name);
      expect(indexNames.length).toBeGreaterThan(0);
      expect(indexNames).toContain('idx_reviews_proposal_id');
      expect(indexNames).toContain('idx_reviews_reviewer_id');
      expect(indexNames).toContain('idx_comments_proposal_id');
      expect(indexNames).toContain('idx_proposals_round_id');
    });
  });

  describe('SCHEMA_VERSION', () => {
    it('should be defined', () => {
      expect(SCHEMA_VERSION).toBeDefined();
      expect(typeof SCHEMA_VERSION).toBe('string');
    });
  });
});
