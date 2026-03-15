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
  return dataSource;
}
