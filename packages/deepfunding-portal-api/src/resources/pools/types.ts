/**
 * Pool entity from API response
 */
export type Pool = {
  id: number;
  name: string;
  slug: string;
  max_funding_amount: number;
  description: string | null;
  [key: string]: unknown;
};

/**
 * Pools API response (array of pools)
 */
export type PoolApiResponse = Pool[];

/**
 * Pool database record
 */
export type PoolRecord = {
  id: number;
  name: string;
  slug: string;
  maxFundingAmount: number;
  description: string | null;
  rawJson: string;
};

/**
 * Options for fetching pools
 */
export type PoolFetchOptions = Record<string, never>;
