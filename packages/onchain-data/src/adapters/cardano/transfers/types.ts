import type {
  CardanoAssetTransferOrder,
  CardanoAssetTransferProvider,
  CardanoAssetTransferProviderPage,
} from '../provider/contracts.js';
import type { RawCardanoAssetTransaction, RawCardanoTransactionUtxo } from '../provider/types.js';

export const CARDANO_CHAIN = 'cardano';

export type CardanoTransferTarget = {
  chain: typeof CARDANO_CHAIN;
  assetIdentifier: string;
};

export type SyncCardanoAssetTransferResult = {
  chain: typeof CARDANO_CHAIN;
  assetIdentifier: string;
  order: CardanoAssetTransferOrder;
  fromTxHash: string | null;
  toTxHash: string | null;
  pageCount: number;
  attemptedAssetTransactionCount: number;
  insertedAssetTransactionCount: number;
  ignoredAssetTransactionCount: number;
  attemptedUtxoCount: number;
  insertedUtxoCount: number;
  ignoredUtxoCount: number;
};

export type CardanoAssetTransferAdapter = CardanoAssetTransferProvider<
  RawCardanoAssetTransaction,
  RawCardanoTransactionUtxo
>;

export type CardanoAssetTransferPage = CardanoAssetTransferProviderPage<RawCardanoAssetTransaction>;
