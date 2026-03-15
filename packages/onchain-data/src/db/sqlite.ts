import { DataSource } from 'typeorm';
import { TokenTransferSchema, TokenTransferSyncStateSchema } from './schema.js';

export async function createDataSource(dbPath: string): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [TokenTransferSchema, TokenTransferSyncStateSchema],
    synchronize: true,
  });

  await dataSource.initialize();
  return dataSource;
}
