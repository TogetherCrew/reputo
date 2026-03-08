import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOOTSTRAP_SQL, SCHEMA_VERSION } from '../../../src/db/bootstrap.js';
import { cleanupTestDb, createTestDb, getTableNames, tableExists } from '../../utils/db-helpers.js';

describe('Database Bootstrap', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe('BOOTSTRAP_SQL', () => {
    it('should be an array of SQL statements', () => {
      expect(Array.isArray(BOOTSTRAP_SQL)).toBe(true);
      expect(BOOTSTRAP_SQL.length).toBeGreaterThan(0);
    });

    it('should create the meta table', () => {
      const tableNames = getTableNames(db);

      expect(tableExists(db, 'meta')).toBe(true);
      expect(tableNames).toContain('meta');
    });

    it('should create meta table with correct structure', () => {
      expect(tableExists(db, 'meta')).toBe(true);

      const tableInfo = db.sqlite.prepare('PRAGMA table_info(meta)').all() as Array<{ name: string; type: string }>;

      const columnNames = tableInfo.map((col) => col.name);
      expect(columnNames).toContain('key');
      expect(columnNames).toContain('value');
    });
  });

  describe('SCHEMA_VERSION', () => {
    it('should be defined', () => {
      expect(SCHEMA_VERSION).toBeDefined();
      expect(typeof SCHEMA_VERSION).toBe('string');
    });
  });
});
