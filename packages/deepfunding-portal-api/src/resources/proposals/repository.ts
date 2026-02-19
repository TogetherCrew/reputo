import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeProposalToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { ProposalRecord, ProposalWithRound } from './types.js';

/**
 * Create a proposals repository bound to the given database instance.
 */
export function createProposalsRepo(db: DeepFundingPortalDb) {
  return {
    create(data: ProposalWithRound): void {
      db.drizzle.insert(schema.proposals).values(normalizeProposalToRecord(data)).run();
    },

    createMany(items: ProposalWithRound[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.proposals).values(chunk.map(normalizeProposalToRecord)).run();
        }
      })();
    },

    findAll(): ProposalRecord[] {
      return db.drizzle.select().from(schema.proposals).all();
    },

    findByRoundId(roundId: number): ProposalRecord[] {
      return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.roundId, roundId)).all();
    },

    findById(id: number): ProposalRecord | undefined {
      return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.id, id)).get();
    },
  };
}

export type ProposalsRepo = ReturnType<typeof createProposalsRepo>;
