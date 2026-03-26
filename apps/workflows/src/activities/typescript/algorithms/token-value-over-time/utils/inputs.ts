import type { AlgorithmPresetFrozen } from '@reputo/database';
import { type AssetKey, OnchainAssets } from '@reputo/onchain-data';

import type {
  EffectiveDateRange,
  ResolvedSelectedAsset,
  SelectedAssetInput,
  TokenValueOverTimeParams,
} from '../types.js';

export function extractInputs(
  inputs: AlgorithmPresetFrozen['inputs'],
  snapshotCreatedAt: Date,
): TokenValueOverTimeParams {
  const maturationThresholdRaw = inputs.find((input) => input.key === 'maturation_threshold_days')?.value;
  const selectedAssetsRaw = inputs.find((input) => input.key === 'selected_assets')?.value;
  const walletsKey = inputs.find((input) => input.key === 'wallets')?.value;
  const selectedAssets = (selectedAssetsRaw as Array<{ chain: string; asset_identifier: string }>).map((item) => ({
    chain: item.chain,
    assetIdentifier: item.asset_identifier,
  })) as SelectedAssetInput[];

  // Full history: effective range is token genesis (no lower bound) through snapshot run time
  const snapshotUnix = Math.floor(snapshotCreatedAt.getTime() / 1000);
  const effectiveDateRange: EffectiveDateRange = {
    fromTimestampUnix: undefined,
    toTimestampUnix: snapshotUnix,
  };

  return {
    maturationThresholdDays: maturationThresholdRaw as number,
    selectedAssets,
    walletsKey: walletsKey as string,
    effectiveDateRange,
  };
}

export function resolveSelectedAssets(selectedAssets: SelectedAssetInput[]): ResolvedSelectedAsset[] {
  const keys = Object.entries(OnchainAssets) as [AssetKey, (typeof OnchainAssets)[AssetKey]][];
  const resolved: ResolvedSelectedAsset[] = [];

  for (const asset of selectedAssets) {
    for (const [key, meta] of keys) {
      const sameChain = meta.chain.toLowerCase() === asset.chain.toLowerCase();
      const sameIdentifier = meta.assetIdentifier.toLowerCase() === asset.assetIdentifier.toLowerCase();
      if (sameChain && sameIdentifier) {
        resolved.push({
          chain: asset.chain,
          assetIdentifier: asset.assetIdentifier,
          assetKey: key,
        });
        break;
      }
    }
  }

  return resolved;
}

export function resolveSelectedAssetKeys(selectedAssets: SelectedAssetInput[]): AssetKey[] {
  return resolveSelectedAssets(selectedAssets).map((asset) => asset.assetKey);
}
