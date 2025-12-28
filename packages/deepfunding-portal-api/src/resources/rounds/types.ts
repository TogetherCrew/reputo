import type { Pagination } from '../../shared/types/index.js';

/**
 * Pool reference within a round
 */
export type PoolRef = {
  id: number;
};

/**
 * Funding round
 */
export type Round = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pool_id: PoolRef[];
  [key: string]: unknown;
};

/**
 * Rounds API response
 */
export type RoundsResponse = {
  rounds: Round[];
  pagination: Pagination;
};
