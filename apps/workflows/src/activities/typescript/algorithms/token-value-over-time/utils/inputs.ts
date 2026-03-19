import type { AlgorithmPresetFrozen } from '@reputo/database';
import { type AssetKey, OnchainAssets } from '@reputo/onchain-data';

import type { EffectiveDateRange, SelectedAssetInput, TokenValueOverTimeParams } from '../types.js';

export function extractInputs(
  inputs: AlgorithmPresetFrozen['inputs'],
  snapshotCreatedAt: Date,
): TokenValueOverTimeParams {
  const maturationThresholdRaw = inputs.find((input) => input.key === 'maturation_threshold_days')?.value;
  const selectedAssetsRaw = inputs.find((input) => input.key === 'selected_assets')?.value;
  const selectedAssets = (selectedAssetsRaw as Array<{ chain: string; asset_identifier: string }>).map((item) => ({
    chain: item.chain,
    assetIdentifier: item.asset_identifier,
  }));

  // Full history: effective range is token genesis (no lower bound) through snapshot run time
  const snapshotUnix = Math.floor(snapshotCreatedAt.getTime() / 1000);
  const effectiveDateRange: EffectiveDateRange = {
    fromTimestampUnix: undefined,
    toTimestampUnix: snapshotUnix,
  };

  return {
    maturationThresholdDays: maturationThresholdRaw as number,
    selectedAssets,
    effectiveDateRange,
  };
}

export function resolveSelectedAssetKeys(selectedAssets: SelectedAssetInput[]): AssetKey[] {
  const keys = Object.entries(OnchainAssets) as [AssetKey, (typeof OnchainAssets)[AssetKey]][];
  const result = new Set<AssetKey>();

  for (const asset of selectedAssets) {
    for (const [key, meta] of keys) {
      const sameChain = meta.chain.toLowerCase() === asset.chain.toLowerCase();
      const sameIdentifier = meta.assetIdentifier.toLowerCase() === asset.assetIdentifier.toLowerCase();
      if (sameChain && sameIdentifier) {
        result.add(key);
      }
    }
  }

  return [...result];
}
