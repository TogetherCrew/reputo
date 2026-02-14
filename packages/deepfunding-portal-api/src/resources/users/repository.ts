import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeUserToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { User, UserRecord } from './types.js';

/**
 * Create a users repository bound to the given database instance.
 */
export function createUsersRepo(db: DeepFundingPortalDb) {
  return {
    create(data: User): void {
      db.drizzle.insert(schema.users).values(normalizeUserToRecord(data)).run();
    },

    createMany(items: User[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.users).values(chunk.map(normalizeUserToRecord)).run();
        }
      })();
    },

    findAll(): UserRecord[] {
      return db.drizzle.select().from(schema.users).all();
    },

    findById(id: number): UserRecord | undefined {
      return db.drizzle.select().from(schema.users).where(eq(schema.users.id, id)).get();
    },
  };
}

export type UsersRepo = ReturnType<typeof createUsersRepo>;
