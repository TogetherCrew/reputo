import { afterEach, describe, expect, it } from 'vitest';
import { createDataSource } from '../../../src/db/postgres.js';
import { createTestDatabase, hasContainerRuntime } from '../../utils/db-helpers.js';

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describePostgres('Onchain data schema auto-sync', () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = null;
    }
  });

  it('creates the tables and indexes required by the PostgreSQL schema on connect', async () => {
    const testDatabase = await createTestDatabase();
    cleanup = testDatabase.cleanup;

    const ds = await createDataSource(testDatabase.databaseUrl);

    try {
      const tables = await ds.query(`
        SELECT tablename
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('asset_transfers', 'asset_transfer_sync_state')
        ORDER BY tablename
      `);

      const indexes = await ds.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname IN (
            'idx_asset_transfers_asset_from_timestamp_order',
            'idx_asset_transfers_asset_to_timestamp_order'
          )
        ORDER BY indexname
      `);

      expect(tables.map((row: { tablename: string }) => row.tablename)).toEqual([
        'asset_transfer_sync_state',
        'asset_transfers',
      ]);
      expect(indexes.map((row: { indexname: string }) => row.indexname)).toEqual([
        'idx_asset_transfers_asset_from_timestamp_order',
        'idx_asset_transfers_asset_to_timestamp_order',
      ]);
    } finally {
      await ds.destroy();
    }
  });

  it('serializes concurrent schema sync attempts against a fresh database', async () => {
    const testDatabase = await createTestDatabase();
    cleanup = testDatabase.cleanup;

    const [firstDataSource, secondDataSource] = await Promise.all([
      createDataSource(testDatabase.databaseUrl),
      createDataSource(testDatabase.databaseUrl),
    ]);

    try {
      expect(firstDataSource.isInitialized).toBe(true);
      expect(secondDataSource.isInitialized).toBe(true);
    } finally {
      await Promise.all([firstDataSource.destroy(), secondDataSource.destroy()]);
    }
  });
});
