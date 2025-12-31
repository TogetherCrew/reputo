import type { DeepFundingClient } from '../../api/client.js';
import { endpoints } from '../../api/endpoints.js';
import type { PaginatedFetcher } from '../../shared/types/index.js';
import type { User, UserApiResponse, UserFetchOptions } from './types.js';

/**
 * Fetch all users with pagination
 */
export async function* fetchUsers(client: DeepFundingClient, options: UserFetchOptions = {}): PaginatedFetcher<User> {
  let page = options.page ?? 1;
  const limit = options.limit ?? client.config.defaultPageLimit;

  while (true) {
    const response = await client.get<UserApiResponse>(endpoints.users(), {
      page,
      limit,
    });
    yield { data: response.users, pagination: response.pagination };

    if (response.pagination.next_page === null) {
      break;
    }
    page = response.pagination.next_page;
  }
}
