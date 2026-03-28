import type {
  ReplayStats,
  ResourceId,
  SelectedResourceInput,
  TokenValueOverTimeBenchmark,
  WalletScoreDetail,
} from '../types.js';

export function formatBenchmarkOutput(input: {
  snapshotId: string;
  maturationThresholdDays: number;
  selectedResources: SelectedResourceInput[];
  selectedResourceIds: ResourceId[];
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
      selected_resources: input.selectedResources,
      selected_resource_ids: input.selectedResourceIds,
      target_wallet_count: input.targetWalletCount,
      transfer_count: input.transferCount,
      replay: input.replay,
    },
  };
}
