import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { CreateDbOptions, DeepFundingPortalDb as DeepFundingPortalDbType } from '../shared/types/db.js';
import { BOOTSTRAP_SQL } from './bootstrap.js';
import * as schema from './schema.js';

/**
 * Options for creating a new database
 */
/**
 * DeepFunding Portal database wrapper
 */
export type { CreateDbOptions, DeepFundingPortalDb } from '../shared/types/db.js';

/**
 * Create a new DeepFunding Portal database
 *
 * @throws {DatabaseExistsError} If the file exists and overwrite is not true
 */
export function createNewDeepFundingDb(options: CreateDbOptions): DeepFundingPortalDbType {
  const { path } = options;

  const sqlite = new Database(path);

  for (const sql of BOOTSTRAP_SQL) {
    sqlite.exec(sql);
  }

  const drizzleDb = drizzle(sqlite, { schema });

  return {
    sqlite,
    drizzle: drizzleDb,
  };
}

/**
 * Close a DeepFunding Portal database connection
 */
export function closeDeepFundingDb(db: DeepFundingPortalDbType): void {
  db.sqlite.close();
}
