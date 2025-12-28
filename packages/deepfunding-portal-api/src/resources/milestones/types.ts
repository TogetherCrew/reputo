import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * Milestone status
 */
export type MilestoneStatus = 'not_started' | 'pending' | 'in_progress' | 'completed';

/**
 * Milestone
 */
export type Milestone = {
  id: number | string;
  proposal_id: number;
  title: string;
  status: MilestoneStatus;
  description: string;
  development_description: string;
  budget: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

/**
 * Milestones API response
 */
export type MilestonesResponse = {
  milestones: Milestone[];
  pagination: Pagination;
};

/**
 * Options for fetching milestones
 */
export type MilestonesFetchOptions = PaginationOptions & {
  /** Filter by proposal ID */
  proposalId?: number;
  /** Filter by status */
  status?: MilestoneStatus;
};
