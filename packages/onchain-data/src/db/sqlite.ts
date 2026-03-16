import { DataSource } from 'typeorm';
import { AssetTransferSchema, AssetTransferSyncStateSchema } from './schema.js';

export async function createDataSource(dbPath: string): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [AssetTransferSchema, AssetTransferSyncStateSchema],
    synchronize: true,
  });

  await dataSource.initialize();
  await dataSource.query('PRAGMA journal_mode = WAL');
  await dataSource.query('PRAGMA synchronous = NORMAL');
  await dataSource.query('PRAGMA temp_store = MEMORY');
  await dataSource.query('PRAGMA busy_timeout = 5000');
  return dataSource;
}
