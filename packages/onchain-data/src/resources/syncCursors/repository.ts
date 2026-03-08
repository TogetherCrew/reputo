import { and, eq } from 'drizzle-orm';
import type { OnchainDataDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { SyncCursor } from './types.js';

/**
 * Create a sync-cursors repository bound to the given database instance.
 */
export function createSyncCursorsRepo(db: OnchainDataDb) {
  return {
    /**
     * Insert or replace a sync cursor for (chainId, tokenAddress).
     */
    upsert(cursor: SyncCursor): void {
      db.drizzle
        .insert(schema.syncCursors)
        .values(cursor)
        .onConflictDoUpdate({
          target: [schema.syncCursors.chainId, schema.syncCursors.tokenAddress],
          set: {
            cursorBlock: cursor.cursorBlock,
            updatedAt: cursor.updatedAt,
          },
        })
        .run();
    },

    findAll() {
      return db.drizzle.select().from(schema.syncCursors).all();
    },

    findByChainAndToken(chainId: string, tokenAddress: string) {
      return db.drizzle
        .select()
        .from(schema.syncCursors)
        .where(and(eq(schema.syncCursors.chainId, chainId), eq(schema.syncCursors.tokenAddress, tokenAddress)))
        .get();
    },

    findByChain(chainId: string) {
      return db.drizzle.select().from(schema.syncCursors).where(eq(schema.syncCursors.chainId, chainId)).all();
    },
  };
}

export type SyncCursorsRepo = ReturnType<typeof createSyncCursorsRepo>;
