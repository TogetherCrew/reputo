import type { EntityManager } from 'typeorm';

import { EvmAssetTransferEntitySchema, type EvmAssetTransferRow } from './schema.js';

export type InsertEvmAssetTransfersResult = {
  attemptedCount: number;
  insertedCount: number;
  ignoredCount: number;
};

export async function insertEvmAssetTransfers(
  manager: EntityManager,
  rows: EvmAssetTransferRow[],
): Promise<InsertEvmAssetTransfersResult> {
  if (rows.length === 0) {
    return {
      attemptedCount: 0,
      insertedCount: 0,
      ignoredCount: 0,
    };
  }

  const result = await manager
    .getRepository(EvmAssetTransferEntitySchema)
    .createQueryBuilder()
    .insert()
    .into(EvmAssetTransferEntitySchema)
    .values(rows)
    .orIgnore()
    .returning('1')
    .execute();

  const insertedCount = Array.isArray(result.raw) ? result.raw.length : 0;

  return {
    attemptedCount: rows.length,
    insertedCount,
    ignoredCount: rows.length - insertedCount,
  };
}
