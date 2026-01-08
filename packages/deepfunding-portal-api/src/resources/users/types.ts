import type { Pagination, PaginationOptions } from '../../shared/types/index.js';

/**
 * User entity from API response
 */
export type User = {
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
export type UserApiResponse = {
  users: User[];
  pagination: Pagination;
};

/**
 * User database record
 */
export type UserRecord = {
  id: number;
  collectionId: string;
  userName: string;
  email: string;
  totalProposals: number;
  rawJson: string;
};

/**
 * Options for fetching users
 */
export type UserFetchOptions = PaginationOptions;
