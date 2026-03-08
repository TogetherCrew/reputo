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

    it('should create all required tables', () => {
      const tableNames = getTableNames(db);
      const expectedTables = ['meta', 'transfers', 'sync_cursors'];

      for (const tableName of expectedTables) {
        expect(tableExists(db, tableName)).toBe(true);
        expect(tableNames).toContain(tableName);
      }
    });

    it('should create meta table with correct structure', () => {
      const tableInfo = db.sqlite.prepare('PRAGMA table_info(meta)').all() as Array<{ name: string; type: string }>;
      const columnNames = tableInfo.map((col) => col.name);

      expect(columnNames).toContain('key');
      expect(columnNames).toContain('value');
    });

    it('should create transfers table with correct structure', () => {
      const tableInfo = db.sqlite.prepare('PRAGMA table_info(transfers)').all() as Array<{
        name: string;
        type: string;
      }>;
      const columnNames = tableInfo.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('chain_id');
      expect(columnNames).toContain('block_number');
      expect(columnNames).toContain('block_hash');
      expect(columnNames).toContain('block_timestamp');
      expect(columnNames).toContain('transaction_hash');
      expect(columnNames).toContain('log_index');
      expect(columnNames).toContain('from_address');
      expect(columnNames).toContain('to_address');
      expect(columnNames).toContain('token_address');
      expect(columnNames).toContain('value');
      expect(columnNames).toContain('asset_category');
      expect(columnNames).toContain('raw_json');
    });

    it('should create sync_cursors table with correct structure', () => {
      const tableInfo = db.sqlite.prepare('PRAGMA table_info(sync_cursors)').all() as Array<{
        name: string;
        type: string;
      }>;
      const columnNames = tableInfo.map((col) => col.name);

      expect(columnNames).toContain('chain_id');
      expect(columnNames).toContain('token_address');
      expect(columnNames).toContain('cursor_block');
      expect(columnNames).toContain('updated_at');
    });

    it('should create indexes', () => {
      const indexes = db.sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'")
        .all() as Array<{ name: string }>;
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain('idx_transfers_chain_token');
      expect(indexNames).toContain('idx_transfers_chain_block');
      expect(indexNames).toContain('idx_transfers_from');
      expect(indexNames).toContain('idx_transfers_to');
    });

    it('should enable WAL journal mode for file-based databases', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const os = await import('node:os');
      const { createDb: createFileDb, closeDbInstance: closeFileDb } = await import('../../../src/db/client.js');

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'onchain-test-'));
      const dbPath = path.join(tmpDir, 'test.db');

      const fileDb = createFileDb({ path: dbPath });
      try {
        const result = fileDb.sqlite.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
        expect(result.journal_mode).toBe('wal');
      } finally {
        closeFileDb(fileDb);
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('SCHEMA_VERSION', () => {
    it('should be defined', () => {
      expect(SCHEMA_VERSION).toBeDefined();
      expect(typeof SCHEMA_VERSION).toBe('string');
    });
  });
});
