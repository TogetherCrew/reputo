import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Milestone } from './types.js';

/**
 * Create a milestone in the database
 */
export function create(db: DeepFundingPortalDb, data: Milestone): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.milestones)
    .values({
      id: data.id as string,
      proposalId: data.proposal_id,
      title: data.title,
      status: data.status,
      description: data.description,
      developmentDescription: data.development_description,
      budget: data.budget,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all milestones
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.milestones).all();
}

/**
 * Find milestones by proposal ID
 */
export function findByProposalId(db: DeepFundingPortalDb, proposalId: number) {
  return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.proposalId, proposalId)).all();
}

/**
 * Find a milestone by ID
 */
export function findById(db: DeepFundingPortalDb, id: string) {
  return db.drizzle.select().from(schema.milestones).where(eq(schema.milestones.id, id)).get();
}

/**
 * Milestones repository
 */
export const milestonesRepo = {
  create,
  findAll,
  findByProposalId,
  findById,
};
