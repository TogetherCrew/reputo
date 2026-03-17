import { DataSource } from 'typeorm';
import { AssetTransferSchema, AssetTransferSyncStateSchema } from './schema.js';

export async function createDataSource(dbPath: string): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [AssetTransferSchema, AssetTransferSyncStateSchema],

    synchronize: false,

    prepareDatabase: (db) => {
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('temp_store = MEMORY');
      db.pragma('busy_timeout = 10000');
    },
  });

  await dataSource.initialize();
  return dataSource;
}
