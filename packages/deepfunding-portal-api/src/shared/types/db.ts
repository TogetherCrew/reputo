import type Database from 'better-sqlite3';

/**
 * Options for creating a new database
 */
export type CreateDbOptions = {
  /** Path to the SQLite database file */
  path: string;
};

/**
 * DeepFunding Portal database wrapper
 *
 * Note: The drizzle type is inferred from the schema at runtime.
 * This type represents the structure without the full drizzle type.
 */
export type DeepFundingPortalDb = {
  /** Underlying SQLite database connection */
  sqlite: Database.Database;
  /** Drizzle ORM database instance */
  drizzle: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<any>>;
};
