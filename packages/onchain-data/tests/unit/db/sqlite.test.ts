import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDataSource } from '../../../src/db/sqlite.js';

describe('createDataSource', () => {
  let tempDir: string | null = null;

  afterEach(async () => {
    if (tempDir != null) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it('bootstraps the schema when the sqlite file does not exist yet', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'reputo-onchain-data-'));
    const dbPath = join(tempDir, 'onchain-data.db');

    await expect(access(dbPath)).rejects.toThrow();

    const dataSource = await createDataSource(dbPath);

    await expect(access(dbPath)).resolves.toBeUndefined();

    const transferTables = await dataSource.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('asset_transfers', 'asset_transfer_sync_state')",
    );

    expect(transferTables).toHaveLength(2);

    await dataSource.destroy();
  });
});
