import type Database from 'better-sqlite3';

/**
 * Options for creating a new database
 */
export type CreateDbOptions = {
  path: string;
};

/**
 * Onchain data database wrapper
 */
export type OnchainDataDb = {
  sqlite: Database.Database;
  drizzle: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle>;
};
