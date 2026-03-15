import type { SupportedTokenChain } from '@reputo/onchain-data';

import type { ReplayStats, SelectedAssetInput, TokenValueOverTimeBenchmark, WalletScoreDetail } from '../types.js';

export function formatBenchmarkOutput(input: {
  snapshotId: string;
  maturationThresholdDays: number;
  selectedAssets: SelectedAssetInput[];
  selectedTokenChains: SupportedTokenChain[];
  targetWalletCount: number;
  transferCount: number;
  replay: ReplayStats;
  wallets: WalletScoreDetail[];
}): TokenValueOverTimeBenchmark {
  return {
    wallets: input.wallets,
    metadata: {
      snapshot_id: input.snapshotId,
      computed_at: new Date().toISOString(),
      maturation_threshold_days: input.maturationThresholdDays,
      selected_assets: input.selectedAssets,
      selected_token_chains: input.selectedTokenChains,
      target_wallet_count: input.targetWalletCount,
      transfer_count: input.transferCount,
      replay: input.replay,
    },
  };
}
