import { DataSource } from 'typeorm';

import { ONCHAIN_DATA_ENTITY_SCHEMAS } from '../adapters/entities.js';

export async function createDb(input: { databaseUrl: string }): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: input.databaseUrl,
    entities: ONCHAIN_DATA_ENTITY_SCHEMAS,
    synchronize: false,
  });
  try {
    await dataSource.initialize();
    return dataSource;
  } catch (error) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    throw error;
  }
}
