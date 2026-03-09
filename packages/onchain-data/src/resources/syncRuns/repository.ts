import { and, desc, eq } from 'drizzle-orm';
import type { OnchainDataDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { SyncRun, SyncRunStatus } from './types.js';

export type SyncRunUpdate = {
  status: SyncRunStatus;
  effectiveToBlock?: number | null;
  errorSummary?: string | null;
  completedAt: string;
};

/**
 * Create a sync-runs repository bound to the given database instance.
 */
export function createSyncRunsRepo(db: OnchainDataDb) {
  return {
    /** Insert a new sync run and return the auto-generated id. */
    create(run: Omit<SyncRun, 'id'>): number {
      const result = db.drizzle.insert(schema.syncRuns).values(run).run();
      return Number(result.lastInsertRowid);
    },

    /** Update an existing sync run's status and completion fields. */
    updateStatus(id: number, update: SyncRunUpdate): void {
      db.drizzle
        .update(schema.syncRuns)
        .set({
          status: update.status,
          ...(update.effectiveToBlock !== undefined && { effectiveToBlock: update.effectiveToBlock }),
          ...(update.errorSummary !== undefined && { errorSummary: update.errorSummary }),
          completedAt: update.completedAt,
        })
        .where(eq(schema.syncRuns.id, id))
        .run();
    },

    findById(id: number) {
      return db.drizzle.select().from(schema.syncRuns).where(eq(schema.syncRuns.id, id)).get();
    },

    findByTarget(chainId: string, tokenAddress: string) {
      return db.drizzle
        .select()
        .from(schema.syncRuns)
        .where(and(eq(schema.syncRuns.chainId, chainId), eq(schema.syncRuns.tokenAddress, tokenAddress)))
        .orderBy(desc(schema.syncRuns.id))
        .all();
    },
  };
}

export type SyncRunsRepo = ReturnType<typeof createSyncRunsRepo>;
