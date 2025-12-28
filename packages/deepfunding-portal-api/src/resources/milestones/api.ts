import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { PaginatedFetcher } from '../../shared/types/index.js';
import type { Milestone, MilestonesFetchOptions, MilestonesResponse } from './types.js';

/**
 * Fetch milestones with pagination
 */
export async function* fetchMilestones(
  client: DeepFundingClient,
  options: MilestonesFetchOptions = {},
): PaginatedFetcher<Milestone> {
  let page = options.page ?? 1;
  const limit = options.limit ?? client.config.defaultPageLimit;

  while (true) {
    const params: Record<string, string | number> = { page, limit };
    if (options.proposalId !== undefined) {
      params.proposal_id = options.proposalId;
    }
    if (options.status !== undefined) {
      params.status = options.status;
    }

    const response = await client.get<MilestonesResponse>(endpoints.milestones(), params);
    yield { data: response.milestones, pagination: response.pagination };

    if (response.pagination.next_page === null) {
      break;
    }
    page = response.pagination.next_page;
  }
}
