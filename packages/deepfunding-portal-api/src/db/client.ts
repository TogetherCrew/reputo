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
export type {
  CreateDbOptions,
  DeepFundingPortalDb,
} from '../shared/types/db.js';

/**
 * Singleton instance of the database
 */
let dbInstance: DeepFundingPortalDbType | null = null;

/**
 * Get the singleton database instance
 *
 * @throws {Error} If the database has not been initialized
 */
export function getDb(): DeepFundingPortalDbType {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initializeDb() first.');
  }
  return dbInstance;
}

/**
 * Initialize the singleton database instance
 *
 * @param options - Database creation options
 * @throws {DatabaseExistsError} If the file exists and overwrite is not true
 */
export function initializeDb(options: CreateDbOptions): DeepFundingPortalDbType {
  if (dbInstance) {
    // If already initialized, close the existing connection
    dbInstance.sqlite.close();
  }

  const { path } = options;

  const sqlite = new Database(path);

  for (const sql of BOOTSTRAP_SQL) {
    sqlite.exec(sql);
  }

  const drizzleDb = drizzle(sqlite, { schema });

  dbInstance = {
    sqlite,
    drizzle: drizzleDb,
  };

  return dbInstance;
}

/**
 * Create a new DeepFunding Portal database
 *
 * @deprecated Use initializeDb() instead for singleton pattern
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
 * Close the singleton database connection
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.sqlite.close();
    dbInstance = null;
  }
}

/**
 * Close a DeepFunding Portal database connection
 *
 * @deprecated Use closeDb() instead for singleton pattern
 */
export function closeDeepFundingDb(db: DeepFundingPortalDbType): void {
  db.sqlite.close();
}
