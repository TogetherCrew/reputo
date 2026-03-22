import { randomUUID } from 'node:crypto';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import type { DataSource } from 'typeorm';
import { createDataSource } from '../../src/db/postgres.js';

let containerPromise: Promise<StartedPostgreSqlContainer> | null = null;
const dataSourceCleanup = new WeakMap<DataSource, () => Promise<void>>();

// PostgreSQL-backed tests are opt-in because they require a working container runtime.
export const hasContainerRuntime = process.env.RUN_POSTGRES_TESTS === 'true';

async function getTestContainer(): Promise<StartedPostgreSqlContainer> {
  containerPromise ??= new PostgreSqlContainer('postgres:16')
    .withDatabase('onchain_data_test_admin')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  return containerPromise;
}

function buildDatabaseUrl(container: StartedPostgreSqlContainer, databaseName: string): string {
  const url = new URL(container.getConnectionUri());
  url.pathname = `/${databaseName}`;
  return url.toString();
}

async function withAdminClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const container = await getTestContainer();
  const client = new Client({
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  });

  await client.connect();

  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function createTestDatabase(): Promise<{
  databaseUrl: string;
  cleanup: () => Promise<void>;
}> {
  const container = await getTestContainer();
  const databaseName = `onchain_data_${randomUUID().replace(/-/g, '')}`;

  await withAdminClient(async (client) => {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  });

  return {
    databaseUrl: buildDatabaseUrl(container, databaseName),
    cleanup: async () => {
      await withAdminClient(async (client) => {
        await client.query(
          `
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = $1 AND pid <> pg_backend_pid()
          `,
          [databaseName],
        );
        await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
      });
    },
  };
}

export async function createTestDataSource(): Promise<DataSource> {
  const { databaseUrl, cleanup } = await createTestDatabase();

  const ds = await createDataSource(databaseUrl);
  dataSourceCleanup.set(ds, cleanup);
  return ds;
}

export async function closeTestDataSource(ds: DataSource | null | undefined): Promise<void> {
  if (!ds) {
    return;
  }

  const cleanup = dataSourceCleanup.get(ds);

  if (ds.isInitialized) {
    await ds.destroy();
  }

  if (cleanup) {
    await cleanup();
  }
}
