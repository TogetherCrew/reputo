import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeRoundToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Round } from './types.js';

/**
 * Create a rounds repository bound to the given database instance.
 */
export function createRoundsRepo(db: DeepFundingPortalDb) {
  return {
    create(data: Round): void {
      db.drizzle.insert(schema.rounds).values(normalizeRoundToRecord(data)).run();
    },

    createMany(items: Round[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.rounds).values(chunk.map(normalizeRoundToRecord)).run();
        }
      })();
    },

    findAll() {
      return db.drizzle.select().from(schema.rounds).all();
    },

    findById(id: number) {
      return db.drizzle.select().from(schema.rounds).where(eq(schema.rounds.id, id)).get();
    },
  };
}

export type RoundsRepo = ReturnType<typeof createRoundsRepo>;
