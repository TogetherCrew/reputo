import { afterEach, describe, expect, it } from 'vitest';

import { createDb } from '../../src/index.js';
import { createTestDatabase, hasContainerRuntime } from '../utils/db-helpers.js';

const describePostgres = hasContainerRuntime ? describe : describe.skip;

describePostgres('createDb', () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    await cleanup?.();
    cleanup = null;
  });

  it('initializes without emitting the pg concurrent query deprecation warning', async () => {
    const database = await createTestDatabase();
    cleanup = database.cleanup;

    const warnings: Error[] = [];
    const warningListener = (warning: Error) => {
      warnings.push(warning);
    };

    process.on('warning', warningListener);

    try {
      const db = await createDb({
        databaseUrl: database.databaseUrl,
      });

      await db.destroy();
    } finally {
      process.off('warning', warningListener);
    }

    expect(
      warnings.some(
        (warning) =>
          warning.name === 'DeprecationWarning' &&
          warning.message.includes('Calling client.query() when the client is already executing a query'),
      ),
    ).toBe(false);
  });
});
