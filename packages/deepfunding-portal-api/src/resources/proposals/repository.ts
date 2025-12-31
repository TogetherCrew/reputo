import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeProposalToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { ProposalWithRound } from './types.js';

/**
 * Create a proposal in the database
 */
export function create(data: ProposalWithRound): void {
  const db = getDb();
  db.drizzle.insert(schema.proposals).values(normalizeProposalToRecord(data)).run();
}

/**
 * Create multiple proposals in the database with chunking and transaction support
 *
 * @param items - Array of proposals to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: ProposalWithRound[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.proposals).values(chunk.map(normalizeProposalToRecord)).run();
    }
  })();
}

/**
 * Find all proposals
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.proposals).all();
}

/**
 * Find proposals by round ID
 */
export function findByRoundId(roundId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.roundId, roundId)).all();
}

/**
 * Find a proposal by ID
 */
export function findById(id: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.id, id)).get();
}

/**
 * Proposals repository
 */
export const proposalsRepo = {
  create,
  createMany,
  findAll,
  findByRoundId,
  findById,
};
