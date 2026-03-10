import BetterSqlite3 from 'better-sqlite3';
import { INITIAL_MIGRATION } from './schema.js';

export type Database = {
  readonly sqlite: BetterSqlite3.Database;
  transaction<T>(fn: () => T): T;
  close(): void;
};

export function createDatabase(dbPath: string): Database {
  const sqlite = new BetterSqlite3(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.exec(INITIAL_MIGRATION);

  return {
    sqlite,
    transaction<T>(fn: () => T): T {
      return sqlite.transaction(fn)();
    },
    close() {
      sqlite.close();
    },
  };
}
