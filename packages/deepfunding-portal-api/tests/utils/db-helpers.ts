import { closeDb, type DeepFundingPortalDb, initializeDb } from '../../src/db/client.js';

/**
 * Create an in-memory database for testing
 */
export function createTestDb(): DeepFundingPortalDb {
  return initializeDb({ path: ':memory:' });
}

/**
 * Clean up test database
 */
export function cleanupTestDb(): void {
  closeDb();
}

/**
 * Execute SQL directly on a database instance
 */
export function execSql(db: DeepFundingPortalDb, sql: string): void {
  db.sqlite.exec(sql);
}

/**
 * Check if a table exists in the database
 */
export function tableExists(db: DeepFundingPortalDb, tableName: string): boolean {
  const result = db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return result !== undefined;
}

/**
 * Get all table names in the database
 */
export function getTableNames(db: DeepFundingPortalDb): string[] {
  const results = db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{
    name: string;
  }>;
  return results.map((r) => r.name);
}
