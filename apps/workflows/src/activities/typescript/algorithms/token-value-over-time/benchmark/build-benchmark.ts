import type {
  ReplayStats,
  ResourceId,
  SelectedResourceInput,
  SubIdScoreDetail,
  TokenValueOverTimeBenchmark,
} from '../types.js';

export function formatBenchmarkOutput(input: {
  snapshotId: string;
  maturationThresholdDays: number;
  selectedResources: SelectedResourceInput[];
  selectedResourceIds: ResourceId[];
  subIdCount: number;
  targetWalletCount: number;
  transferCount: number;
  replay: ReplayStats;
  subIds: SubIdScoreDetail[];
}): TokenValueOverTimeBenchmark {
  return {
    sub_ids: input.subIds,
    metadata: {
      snapshot_id: input.snapshotId,
      computed_at: new Date().toISOString(),
      maturation_threshold_days: input.maturationThresholdDays,
      selected_resources: input.selectedResources,
      selected_resource_ids: input.selectedResourceIds,
      sub_id_count: input.subIdCount,
      target_wallet_count: input.targetWalletCount,
      transfer_count: input.transferCount,
      replay: input.replay,
    },
  };
}
