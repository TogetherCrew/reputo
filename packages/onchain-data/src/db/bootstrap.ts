/**
 * Schema version for database migrations
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * SQL statements to bootstrap the database schema.
 *
 * Resource-specific tables will be added as resources are implemented.
 */
export const BOOTSTRAP_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
   );`,
];
