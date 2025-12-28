import type { Pagination } from './api.js';

/**
 * Pagination options for fetchers
 */
export type PaginationOptions = {
  /** Starting page (default: 1) */
  page?: number;
  /** Items per page (uses client's defaultPageLimit if not specified) */
  limit?: number;
};

/**
 * Page result with data and pagination info
 */
export type PageResult<T> = {
  data: T[];
  pagination: Pagination;
};

/**
 * Generic paginated fetch function type
 */
export type PaginatedFetcher<T> = AsyncGenerator<PageResult<T>, void, unknown>;
