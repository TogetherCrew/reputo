import type { components } from '@blockfrost/openapi';

export type RawCardanoAssetTransaction = components['schemas']['asset_transactions'][number];
export type RawCardanoTransactionUtxo = components['schemas']['tx_content_utxo'];
