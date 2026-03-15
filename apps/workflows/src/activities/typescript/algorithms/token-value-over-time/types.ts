import type { AssetKey, AssetTransferRecord } from '@reputo/onchain-data';

export interface SelectedAssetInput {
  chain: string;
  assetIdentifier: string;
}

export interface TokenValueOverTimeParams {
  maturationThresholdDays: number;
  selectedAssets: SelectedAssetInput[];
}

export interface OrderedTransferEvent {
  assetKey: AssetKey;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  fromAddress: string | null;
  toAddress: string | null;
  amount: number;
  blockTimestamp: string | null;
}

export type WalletLot = {
  assetKey: AssetKey;
  amountRemaining: number;
  receivedAt: string | null;
  sourceTransferId: string;
};

export type WalletLotsState = Map<string, WalletLot[]>;

export interface ReplayStats {
  processed: number;
  skippedZeroAmount: number;
  skippedSelfTransfers: number;
}

export interface LotScoreDetail {
  asset_key: AssetKey;
  source_transfer_id: string;
  amount_remaining: number;
  age_days: number;
  weight: number;
  lot_value: number;
}

export interface WalletScoreDetail {
  wallet_address: string;
  token_value: number;
  lots: LotScoreDetail[];
}

export interface TokenValueOverTimeBenchmark {
  wallets: WalletScoreDetail[];
  metadata: {
    snapshot_id: string;
    computed_at: string;
    maturation_threshold_days: number;
    selected_assets: SelectedAssetInput[];
    selected_asset_keys: AssetKey[];
    target_wallet_count: number;
    transfer_count: number;
    replay: ReplayStats;
  };
}

export const SCORE_PRECISION = 6;

export function roundScore(score: number): number {
  return Math.round(score * 10 ** SCORE_PRECISION) / 10 ** SCORE_PRECISION;
}

export function toTransferEvent(record: AssetTransferRecord, assetKey: AssetKey): OrderedTransferEvent {
  return {
    assetKey,
    blockNumber: record.blockNumber,
    transactionHash: record.transactionHash,
    logIndex: record.logIndex,
    fromAddress: record.fromAddress,
    toAddress: record.toAddress,
    amount: Number(record.amount),
    blockTimestamp: record.blockTimestamp,
  };
}
