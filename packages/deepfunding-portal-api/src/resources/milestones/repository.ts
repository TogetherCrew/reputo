import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeMilestoneToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { Milestone } from './types.js';

/**
 * Create a milestone in the database
 */
export function create(data: Milestone): void {
  const db = getDb();
  db.drizzle.insert(schema.milestones).values(normalizeMilestoneToRecord(data)).run();
}

/**
 * Create multiple milestones in the database with chunking and transaction support
 *
 * @param items - Array of milestones to insert
 * @param options - Optional configuration for chunk size
 */
export function createMany(items: Milestone[], options?: CreateManyOptions): void {
  const db = getDb();
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunks = chunkArray(items, chunkSize);

  db.sqlite.transaction(() => {
    for (const chunk of chunks) {
      db.drizzle.insert(schema.milestones).values(chunk.map(normalizeMilestoneToRecord)).run();
    }
  })();
}

/**
 * Find all milestones
 */
export function findAll() {
  const db = getDb();
  return db.drizzle.select().from(schema.milestones).all();
}

/**
 * Find milestones by proposal ID
 */
export function findByProposalId(proposalId: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.proposalId, proposalId)).all();
}

/**
 * Find a milestone by ID
 */
export function findById(id: number) {
  const db = getDb();
  return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.id, id)).get();
}

/**
 * Milestones repository
 */
export const milestonesRepo = {
  create,
  createMany,
  findAll,
  findByProposalId,
  findById,
};
