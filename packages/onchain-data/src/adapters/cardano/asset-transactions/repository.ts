import type { EntityManager } from 'typeorm';

import { CardanoAssetTransactionEntitySchema, type CardanoAssetTransactionRow } from './schema.js';

export type InsertCardanoAssetTransactionsResult = {
  attemptedCount: number;
  insertedCount: number;
  ignoredCount: number;
};

export async function insertCardanoAssetTransactions(
  manager: EntityManager,
  rows: CardanoAssetTransactionRow[],
): Promise<InsertCardanoAssetTransactionsResult> {
  if (rows.length === 0) {
    return {
      attemptedCount: 0,
      insertedCount: 0,
      ignoredCount: 0,
    };
  }

  const result = await manager
    .getRepository(CardanoAssetTransactionEntitySchema)
    .createQueryBuilder()
    .insert()
    .into(CardanoAssetTransactionEntitySchema)
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
