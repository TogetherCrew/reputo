import type { Pagination } from '../../shared/types/index.js';

/**
 * User list item
 */
export type UserListItem = {
  id: number;
  collection_id: string;
  user_name: string;
  email: string;
  total_proposals: number;
  [key: string]: unknown;
};

/**
 * Users API response
 */
export type UsersResponse = {
  users: UserListItem[];
  pagination: Pagination;
};
