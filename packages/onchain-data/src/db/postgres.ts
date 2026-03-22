import { Client } from 'pg';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { AssetTransferSchema, AssetTransferSyncStateSchema } from './schema.js';

const SCHEMA_SYNC_LOCK_KEY_1 = 0x72657075;
const SCHEMA_SYNC_LOCK_KEY_2 = 0x6f636864;

export function getDataSourceOptions(databaseUrl: string): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [AssetTransferSchema, AssetTransferSyncStateSchema],
    synchronize: false,
    parseInt8: true,
  };
}

export async function createDataSource(databaseUrl: string): Promise<DataSource> {
  const dataSource = new DataSource(getDataSourceOptions(databaseUrl));
  try {
    await dataSource.initialize();
    await synchronizeSchema(dataSource, databaseUrl);
    return dataSource;
  } catch (error) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    throw error;
  }
}

async function synchronizeSchema(dataSource: DataSource, databaseUrl: string): Promise<void> {
  const lockClient = new Client({ connectionString: databaseUrl });
  let unlockError: unknown;

  await lockClient.connect();

  try {
    // Serialize schema sync across multiple workers that may connect to a fresh database together.
    await lockClient.query('SELECT pg_advisory_lock($1, $2)', [SCHEMA_SYNC_LOCK_KEY_1, SCHEMA_SYNC_LOCK_KEY_2]);

    try {
      await dataSource.synchronize();
    } finally {
      try {
        await lockClient.query('SELECT pg_advisory_unlock($1, $2)', [SCHEMA_SYNC_LOCK_KEY_1, SCHEMA_SYNC_LOCK_KEY_2]);
      } catch (error) {
        unlockError = error;
      }
    }
  } finally {
    await lockClient.end();
  }

  if (unlockError != null) {
    throw unlockError;
  }
}
