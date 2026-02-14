import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeDbInstance, createDb } from '../../../src/db/client.js';
import type { DeepFundingPortalDb } from '../../../src/shared/types/db.js';
import { cleanupTestDb, tableExists } from '../../utils/db-helpers.js';

describe('Database Client', () => {
  let db: DeepFundingPortalDb | null = null;

  afterEach(() => {
    if (db) {
      cleanupTestDb(db);
      db = null;
    }
  });

  describe('createDb', () => {
    it('should create database instance', () => {
      db = createDb({ path: ':memory:' });

      expect(db).toBeDefined();
      expect(db.sqlite).toBeDefined();
      expect(db.drizzle).toBeDefined();
    });

    it('should initialize database with schema', () => {
      db = createDb({ path: ':memory:' });

      expect(tableExists(db, 'rounds')).toBe(true);
      expect(tableExists(db, 'pools')).toBe(true);
      expect(tableExists(db, 'proposals')).toBe(true);
      expect(tableExists(db, 'users')).toBe(true);
      expect(tableExists(db, 'milestones')).toBe(true);
      expect(tableExists(db, 'reviews')).toBe(true);
      expect(tableExists(db, 'comments')).toBe(true);
      expect(tableExists(db, 'comment_votes')).toBe(true);
    });

    it('should return independent instances', () => {
      const db1 = createDb({ path: ':memory:' });
      const db2 = createDb({ path: ':memory:' });

      expect(db2).toBeDefined();
      expect(db2).not.toBe(db1);
      closeDbInstance(db1);
      closeDbInstance(db2);
      db = null;
    });
  });

  describe('closeDbInstance', () => {
    it('should close database connection', () => {
      db = createDb({ path: ':memory:' });
      const closeSpy = vi.spyOn(db.sqlite, 'close');

      closeDbInstance(db);

      expect(closeSpy).toHaveBeenCalled();
      db = null;
    });
  });
});
