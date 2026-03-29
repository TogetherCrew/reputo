import { CardanoAssetTransactionEntitySchema } from './asset-transactions/schema.js';
import { CardanoAssetTransactionSyncStateEntitySchema } from './sync-state/schema.js';
import {
  CardanoTransactionUtxoEntitySchema,
  CardanoTransactionUtxoInputAmountEntitySchema,
  CardanoTransactionUtxoInputEntitySchema,
  CardanoTransactionUtxoOutputAmountEntitySchema,
  CardanoTransactionUtxoOutputEntitySchema,
} from './transaction-utxos/schema.js';

export const ONCHAIN_DATA_ENTITY_SCHEMAS = [
  CardanoAssetTransactionEntitySchema,
  CardanoTransactionUtxoEntitySchema,
  CardanoTransactionUtxoInputEntitySchema,
  CardanoTransactionUtxoInputAmountEntitySchema,
  CardanoTransactionUtxoOutputEntitySchema,
  CardanoTransactionUtxoOutputAmountEntitySchema,
  CardanoAssetTransactionSyncStateEntitySchema,
];
