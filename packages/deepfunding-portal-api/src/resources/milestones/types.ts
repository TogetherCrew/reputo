import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Milestone status enum
 */
export type MilestoneStatus = 'not_started' | 'pending' | 'in_progress' | 'completed';

/**
 * Milestone entity from API response (without proposal-level metadata)
 * Note: Individual milestone objects don't include proposal_id, created_at,
 * or updated_at - these are at the group level in the API response.
 */
export type MilestoneRaw = {
  id: number;
  title: string;
  status: MilestoneStatus;
  description: string;
  development_description: string;
  budget: number;
  [key: string]: unknown;
};

/**
 * Milestone entity with full metadata (enriched from API response)
 */
export type Milestone = {
  id: number;
  proposal_id: number;
  title: string;
  status: MilestoneStatus;
  description: string;
  development_description: string;
  budget: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

/**
 * Milestones API response
 * Note: The API returns milestones grouped by proposal.
 */
export type MilestoneApiResponse = {
  milestones: Array<{
    proposal_id: number;
    created_at: string;
    updated_at: string;
    milestones: MilestoneRaw[];
  }>;
  pagination: Pagination;
};

/**
 * Milestone database record
 */
export type MilestoneRecord = {
  id: number;
  proposalId: number;
  title: string;
  status: string;
  description: string;
  developmentDescription: string;
  budget: number;
  createdAt: string | null;
  updatedAt: string | null;
  rawJson: string;
};

/**
 * Options for fetching milestones
 */
export type MilestoneFetchOptions = PaginationOptions & {
  /** Filter by proposal ID */
  proposalId?: number;
  /** Filter by status */
  status?: MilestoneStatus;
};
