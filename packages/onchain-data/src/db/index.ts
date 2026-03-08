/**
 * Database module for onchain data
 */

export type { CreateDbOptions, OnchainDataDb } from '../shared/types/db.js';
export { BOOTSTRAP_SQL, SCHEMA_VERSION } from './bootstrap.js';
export { closeDbInstance, createDb } from './client.js';
