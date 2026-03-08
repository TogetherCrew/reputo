import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { CreateDbOptions, OnchainDataDb } from '../shared/types/db.js';
import { BOOTSTRAP_SQL } from './bootstrap.js';
import * as schema from './schema.js';

/**
 * Create an independent database instance.
 *
 * Each call returns a fresh connection that does **not** share state with any
 * other instance, making it safe for concurrent use.
 *
 * Callers are responsible for closing the instance via {@link closeDbInstance}.
 */
export function createDb(options: CreateDbOptions): OnchainDataDb {
  const { path } = options;
  const sqlite = new Database(path);

  for (const sql of BOOTSTRAP_SQL) {
    sqlite.exec(sql);
  }

  const drizzleDb = drizzle(sqlite, { schema });

  return { sqlite, drizzle: drizzleDb };
}

/**
 * Close a specific database instance returned by {@link createDb}.
 */
export function closeDbInstance(db: OnchainDataDb): void {
  db.sqlite.close();
}
