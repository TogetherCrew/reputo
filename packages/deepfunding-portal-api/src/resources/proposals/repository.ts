import { eq } from 'drizzle-orm';
import type { DeepFundingPortalDb } from '../../shared/types/db.js';
import * as schema from './schema.js';
import type { Proposal } from './types.js';

/**
 * Create a proposal in the database
 */
export function create(db: DeepFundingPortalDb, data: Proposal & { round_id: number }): void {
  const drizzle = db.drizzle;

  drizzle
    .insert(schema.proposals)
    .values({
      id: data.id,
      roundId: data.round_id,
      poolId: data.pool_id,
      proposerId: data.proposer_id,
      title: data.title,
      content: data.content,
      link: data.link,
      featureImage: data.feature_image,
      requestedAmount: data.requested_amount,
      awardedAmount: data.awarded_amount,
      isAwarded: data.is_awarded,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      teamMembers: JSON.stringify(data.team_members || []),
      rawJson: JSON.stringify(data),
    })
    .run();
}

/**
 * Find all proposals
 */
export function findAll(db: DeepFundingPortalDb) {
  return db.drizzle.select().from(schema.proposals).all();
}

/**
 * Find proposals by round ID
 */
export function findByRoundId(db: DeepFundingPortalDb, roundId: number) {
  return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.roundId, roundId)).all();
}

/**
 * Find a proposal by ID
 */
export function findById(db: DeepFundingPortalDb, id: number) {
  return db.drizzle.select().from(schema.proposals).where(eq(schema.proposals.id, id)).get();
}

/**
 * Proposals repository
 */
export const proposalsRepo = {
  create,
  findAll,
  findByRoundId,
  findById,
};
