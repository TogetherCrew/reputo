import type { Pagination } from '../../shared/types/index.js';

/**
 * Funding pool
 */
export type Pool = {
  id: number;
  name: string;
  slug: string;
  max_funding_amount: string;
  description: string;
  [key: string]: unknown;
};

/**
 * Pools API response
 */
export type PoolsResponse = {
  pools: Pool[];
  pagination: Pagination;
};
