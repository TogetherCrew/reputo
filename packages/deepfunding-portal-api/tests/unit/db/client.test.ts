import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeDb, closeDeepFundingDb, createNewDeepFundingDb, getDb, initializeDb } from '../../../src/db/client.js';
import { cleanupTestDb, tableExists } from '../../utils/db-helpers.js';

describe('Database Client', () => {
  afterEach(() => {
    cleanupTestDb();
  });

  describe('initializeDb', () => {
    it('should create database instance', () => {
      const db = initializeDb({ path: ':memory:' });

      expect(db).toBeDefined();
      expect(db.sqlite).toBeDefined();
      expect(db.drizzle).toBeDefined();
    });

    it('should initialize database with schema', () => {
      const db = initializeDb({ path: ':memory:' });

      expect(tableExists(db, 'rounds')).toBe(true);
      expect(tableExists(db, 'pools')).toBe(true);
      expect(tableExists(db, 'proposals')).toBe(true);
      expect(tableExists(db, 'users')).toBe(true);
      expect(tableExists(db, 'milestones')).toBe(true);
      expect(tableExists(db, 'reviews')).toBe(true);
      expect(tableExists(db, 'comments')).toBe(true);
      expect(tableExists(db, 'comment_votes')).toBe(true);
    });

    it('should close existing connection when re-initializing', () => {
      const db1 = initializeDb({ path: ':memory:' });
      const closeSpy = vi.spyOn(db1.sqlite, 'close');

      const db2 = initializeDb({ path: ':memory:' });

      expect(closeSpy).toHaveBeenCalled();
      expect(db2).toBeDefined();
      expect(db2).not.toBe(db1);
    });
  });

  describe('getDb', () => {
    it('should return singleton database instance', () => {
      const db1 = initializeDb({ path: ':memory:' });
      const db2 = getDb();

      expect(db2).toBe(db1);
    });

    it('should throw error when database not initialized', () => {
      cleanupTestDb();

      expect(() => {
        getDb();
      }).toThrow('Database has not been initialized');
    });
  });

  describe('closeDb', () => {
    it('should close database connection and reset singleton', () => {
      const db = initializeDb({ path: ':memory:' });
      const closeSpy = vi.spyOn(db.sqlite, 'close');

      closeDb();

      expect(closeSpy).toHaveBeenCalled();
      expect(() => {
        getDb();
      }).toThrow('Database has not been initialized');
    });

    it('should handle closing when database not initialized', () => {
      cleanupTestDb();

      expect(() => {
        closeDb();
      }).not.toThrow();
    });
  });

  describe('createNewDeepFundingDb (deprecated)', () => {
    it('should create a new database instance', () => {
      const db = createNewDeepFundingDb({ path: ':memory:' });

      expect(db).toBeDefined();
      expect(db.sqlite).toBeDefined();
      expect(db.drizzle).toBeDefined();
    });

    it('should initialize database with schema', () => {
      const db = createNewDeepFundingDb({ path: ':memory:' });

      expect(tableExists(db, 'rounds')).toBe(true);
      expect(tableExists(db, 'pools')).toBe(true);
      expect(tableExists(db, 'proposals')).toBe(true);
    });
  });

  describe('closeDeepFundingDb (deprecated)', () => {
    it('should close database connection', () => {
      const db = createNewDeepFundingDb({ path: ':memory:' });
      const closeSpy = vi.spyOn(db.sqlite, 'close');

      closeDeepFundingDb(db);

      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
