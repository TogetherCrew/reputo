import { Client } from 'pg';
import type { DataSource } from 'typeorm';

const SCHEMA_SYNC_LOCK_KEY_1 = 0x72657075;
const SCHEMA_SYNC_LOCK_KEY_2 = 0x6f636864;

export async function synchronizeSchema(dataSource: DataSource, databaseUrl: string): Promise<void> {
  const client = new Client({
    connectionString: databaseUrl,
  });

  let unlockError: unknown;

  await client.connect();

  try {
    await client.query('SELECT pg_advisory_lock($1, $2)', [SCHEMA_SYNC_LOCK_KEY_1, SCHEMA_SYNC_LOCK_KEY_2]);

    try {
      await dataSource.synchronize();
    } finally {
      try {
        await client.query('SELECT pg_advisory_unlock($1, $2)', [SCHEMA_SYNC_LOCK_KEY_1, SCHEMA_SYNC_LOCK_KEY_2]);
      } catch (error) {
        unlockError = error;
      }
    }
  } finally {
    await client.end();
  }

  if (unlockError != null) {
    throw unlockError;
  }
}
