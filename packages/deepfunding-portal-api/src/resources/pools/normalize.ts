/**
 * Pool normalization - transforms API response to DB record format
 */
import type { Pool, PoolRecord } from './types.js';

/**
 * Normalize a Pool API response to a database record
 *
 * @param data - The pool data from the API
 * @returns The normalized pool record for database insertion
 */
export function normalizePoolToRecord(data: Pool): PoolRecord {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    maxFundingAmount: data.max_funding_amount,
    description: data.description || null,
    rawJson: JSON.stringify(data),
  };
}
