import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizePoolToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Pool } from './types.js';

/**
 * Create a pools repository bound to the given database instance.
 */
export function createPoolsRepo(db: DeepFundingPortalDb) {
  return {
    create(data: Pool): void {
      db.drizzle.insert(schema.pools).values(normalizePoolToRecord(data)).run();
    },

    createMany(items: Pool[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.pools).values(chunk.map(normalizePoolToRecord)).run();
        }
      })();
    },

    findAll() {
      return db.drizzle.select().from(schema.pools).all();
    },

    findById(id: number) {
      return db.drizzle.select().from(schema.pools).where(eq(schema.pools.id, id)).get();
    },
  };
}

export type PoolsRepo = ReturnType<typeof createPoolsRepo>;
