import type { EvmAssetTransferProvider, EvmAssetTransferProviderPage } from '../provider/contracts.js';

export type EvmTransferTarget = {
  chain: string;
  assetIdentifier: string;
};

export type RawEvmAssetTransferContract = {
  value: string | null;
  address: string | null;
  decimal: string | null;
};

export type RawEvmAssetTransferMetadata = {
  blockTimestamp?: string;
};

export interface RawEvmAssetTransfer {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  rawContract: RawEvmAssetTransferContract;
  metadata?: RawEvmAssetTransferMetadata;
}

export type SyncEvmAssetTransferResult = {
  chain: string;
  assetIdentifier: string;
  fromBlock: string;
  toBlock: string;
  pageCount: number;
  attemptedCount: number;
  insertedCount: number;
  ignoredCount: number;
};

export type EvmAssetTransferAdapter = EvmAssetTransferProvider<RawEvmAssetTransfer>;

export type EvmAssetTransferPage = EvmAssetTransferProviderPage<RawEvmAssetTransfer>;
