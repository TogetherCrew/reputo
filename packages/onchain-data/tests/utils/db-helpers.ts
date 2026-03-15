import { DataSource } from 'typeorm';
import { TokenTransferSchema, TokenTransferSyncStateSchema } from '../../src/db/schema.js';

export async function createTestDataSource(): Promise<DataSource> {
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [TokenTransferSchema, TokenTransferSyncStateSchema],
    synchronize: true,
  });
  await ds.initialize();
  return ds;
}

export async function closeTestDataSource(ds: DataSource): Promise<void> {
  if (ds.isInitialized) {
    await ds.destroy();
  }
}
