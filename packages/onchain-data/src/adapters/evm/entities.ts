import { EvmAssetTransferSyncStateEntitySchema } from './sync-state/schema.js';
import { EvmAssetTransferEntitySchema } from './transfers/schema.js';

export const ONCHAIN_DATA_ENTITY_SCHEMAS = [EvmAssetTransferEntitySchema, EvmAssetTransferSyncStateEntitySchema];
