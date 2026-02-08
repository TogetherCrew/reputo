/**
 * Round entity from API response
 */
export type Round = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  pool_id: { id: number }[];
  [key: string]: unknown;
};

/**
 * Rounds API response (array of rounds)
 */
export type RoundApiResponse = Round[];

/**
 * Round database record
 */
export type RoundRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  poolIds: string;
  rawJson: string;
};

/**
 * Options for fetching rounds
 */
export type RoundFetchOptions = Record<string, never>;
