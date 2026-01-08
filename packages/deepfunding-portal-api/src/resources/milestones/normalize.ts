/**
 * Milestone normalization - transforms API response to DB record format
 */
import type { Milestone, MilestoneRecord } from './types.js';

/**
 * Normalize a Milestone API response to a database record
 *
 * @param data - The milestone data from the API
 * @returns The normalized milestone record for database insertion
 * @note The ID is not included - the database will auto-generate it
 */
export function normalizeMilestoneToRecord(data: Milestone): Omit<MilestoneRecord, 'id'> {
  return {
    proposalId: data.proposal_id,
    title: data.title,
    status: data.status,
    description: data.description,
    developmentDescription: data.development_description,
    budget: data.budget,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    rawJson: JSON.stringify(data),
  };
}
