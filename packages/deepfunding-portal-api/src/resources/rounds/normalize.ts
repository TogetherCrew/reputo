/**
 * Round normalization - transforms API response to DB record format
 */
import type { Round, RoundRecord } from './types.js';

/**
 * Normalize a Round API response to a database record
 *
 * @param data - The round data from the API
 * @returns The normalized round record for database insertion
 */
export function normalizeRoundToRecord(data: Round): RoundRecord {
  // Extract pool IDs from pool_id array
  const poolIds = data.pool_id && Array.isArray(data.pool_id) ? data.pool_id.map((p) => p.id) : [];

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    poolIds: JSON.stringify(poolIds),
    rawJson: JSON.stringify(data),
  };
}
