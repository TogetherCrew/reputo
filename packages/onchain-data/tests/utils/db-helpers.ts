import { closeDbInstance, createDb } from '../../src/db/client.js';
import type { OnchainDataDb } from '../../src/shared/types/db.js';

/**
 * Create an in-memory database for testing
 */
export function createTestDb(): OnchainDataDb {
  return createDb({ path: ':memory:' });
}

/**
 * Clean up test database
 */
export function cleanupTestDb(db: OnchainDataDb): void {
  closeDbInstance(db);
}

/**
 * Execute SQL directly on a database instance
 */
export function execSql(db: OnchainDataDb, sql: string): void {
  db.sqlite.exec(sql);
}

/**
 * Check if a table exists in the database
 */
export function tableExists(db: OnchainDataDb, tableName: string): boolean {
  const result = db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return result !== undefined;
}

/**
 * Get all table names in the database
 */
export function getTableNames(db: OnchainDataDb): string[] {
  const results = db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{
    name: string;
  }>;
  return results.map((r) => r.name);
}
