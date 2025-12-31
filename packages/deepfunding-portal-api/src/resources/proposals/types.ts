/**
 * Proposal entity from API response
 */
export type Proposal = {
  id: number;
  pool_id: number;
  proposer_id: number;
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
export type ProposalApiResponse = {
  proposals: Proposal[];
};

/**
 * Proposal database record
 */
export type ProposalRecord = {
  id: number;
  roundId: number;
  poolId: number;
  proposerId: number;
  title: string;
  content: string;
  link: string;
  featureImage: string;
  requestedAmount: string;
  awardedAmount: string;
  isAwarded: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  teamMembers: string;
  rawJson: string;
};

/**
 * Options for fetching proposals
 */
export type ProposalFetchOptions = {
  /** Filter by pool ID */
  poolId?: number;
};

/**
 * Proposal with round context for normalization
 */
export type ProposalWithRound = Proposal & { round_id: number };
