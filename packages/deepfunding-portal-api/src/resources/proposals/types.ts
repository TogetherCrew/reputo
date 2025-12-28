import type { Pagination } from '../../shared/types/index.js';

/**
 * Proposal
 */
export type Proposal = {
  id: number;
  pool_id: number;
  proposer_id: string;
  team_members: number[];
  title: string;
  content: string;
  link: string;
  feature_image: string;
  requested_amount: string;
  awarded_amount: string;
  is_awarded: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
};

/**
 * Proposals API response
 */
export type ProposalsResponse = {
  proposals: Proposal[];
  pagination: Pagination;
};

/**
 * Options for fetching proposals
 */
export type ProposalsFetchOptions = {
  /** Filter by pool ID */
  poolId?: number;
};

/**
 * Context for ingesting proposals
 */
export type IngestProposalsContext = {
  /** Round ID for the proposals */
  round_id: number;
};
