import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeMilestoneToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Milestone } from './types.js';

/**
 * Create a milestones repository bound to the given database instance.
 */
export function createMilestonesRepo(db: DeepFundingPortalDb) {
  return {
    create(data: Milestone): void {
      db.drizzle.insert(schema.milestones).values(normalizeMilestoneToRecord(data)).run();
    },

    createMany(items: Milestone[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.milestones).values(chunk.map(normalizeMilestoneToRecord)).run();
        }
      })();
    },

    findAll() {
      return db.drizzle.select().from(schema.milestones).all();
    },

    findByProposalId(proposalId: number) {
      return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.proposalId, proposalId)).all();
    },

    findById(id: number) {
      return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.id, id)).get();
    },
  };
}

export type MilestonesRepo = ReturnType<typeof createMilestonesRepo>;
