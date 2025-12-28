import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { Proposal, ProposalsFetchOptions } from './types.js';

/**
 * Fetch proposals for a specific round
 */
export async function fetchProposals(
  client: DeepFundingClient,
  roundId: number,
  options: ProposalsFetchOptions = {},
): Promise<Proposal[]> {
  const params: Record<string, string | number> = {};
  if (options.poolId !== undefined) {
    params.pool_id = options.poolId;
  }

  return await client.get<Proposal[]>(endpoints.proposals(roundId), params);
}
