import BetterSqlite3 from 'better-sqlite3';
import { INITIAL_MIGRATION } from '../../src/db/schema.js';

export function createTestDatabase(): BetterSqlite3.Database {
  const db = new BetterSqlite3(':memory:');
  db.exec(INITIAL_MIGRATION);
  return db;
}

export function closeTestDatabase(db: BetterSqlite3.Database): void {
  db.close();
}
