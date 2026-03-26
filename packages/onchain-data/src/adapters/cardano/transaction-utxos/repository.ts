import type { EntityManager, EntitySchema } from 'typeorm';

import {
  CardanoTransactionUtxoEntitySchema,
  CardanoTransactionUtxoInputAmountEntitySchema,
  CardanoTransactionUtxoInputEntitySchema,
  CardanoTransactionUtxoOutputAmountEntitySchema,
  CardanoTransactionUtxoOutputEntitySchema,
  type CardanoTransactionUtxoWriteSet,
} from './schema.js';

export type InsertCardanoTransactionUtxosResult = {
  attemptedCount: number;
  insertedCount: number;
  ignoredCount: number;
};

export async function insertCardanoTransactionUtxos(
  manager: EntityManager,
  writeSets: CardanoTransactionUtxoWriteSet[],
): Promise<InsertCardanoTransactionUtxosResult> {
  if (writeSets.length === 0) {
    return {
      attemptedCount: 0,
      insertedCount: 0,
      ignoredCount: 0,
    };
  }

  const transactionRows = writeSets.map((writeSet) => writeSet.transaction);
  const inputRows = writeSets.flatMap((writeSet) => writeSet.inputs);
  const inputAmountRows = writeSets.flatMap((writeSet) => writeSet.inputAmounts);
  const outputRows = writeSets.flatMap((writeSet) => writeSet.outputs);
  const outputAmountRows = writeSets.flatMap((writeSet) => writeSet.outputAmounts);

  const insertedCount = await insertRows(manager, CardanoTransactionUtxoEntitySchema, transactionRows, {
    returningInsertedRowCount: true,
  });
  await insertRows(manager, CardanoTransactionUtxoInputEntitySchema, inputRows);
  await insertRows(manager, CardanoTransactionUtxoInputAmountEntitySchema, inputAmountRows);
  await insertRows(manager, CardanoTransactionUtxoOutputEntitySchema, outputRows);
  await insertRows(manager, CardanoTransactionUtxoOutputAmountEntitySchema, outputAmountRows);

  return {
    attemptedCount: writeSets.length,
    insertedCount,
    ignoredCount: writeSets.length - insertedCount,
  };
}

async function insertRows<Row extends object>(
  manager: EntityManager,
  schema: EntitySchema<Row>,
  rows: Row[],
  options?: {
    returningInsertedRowCount?: boolean;
  },
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  const queryBuilder = manager.getRepository(schema).createQueryBuilder().insert().into(schema).values(rows).orIgnore();

  if (options?.returningInsertedRowCount) {
    const result = await queryBuilder.returning('1').execute();
    return Array.isArray(result.raw) ? result.raw.length : 0;
  }

  await queryBuilder.execute();
  return 0;
}
