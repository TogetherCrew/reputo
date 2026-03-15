import type { AlgorithmPresetFrozen } from '@reputo/database';
import { type SupportedTokenChain, TOKEN_CHAIN_METADATA } from '@reputo/onchain-data';

import type { SelectedAssetInput, TokenValueOverTimeParams } from '../types.js';

export function extractInputs(inputs: AlgorithmPresetFrozen['inputs']): TokenValueOverTimeParams {
  const maturationThresholdRaw = inputs.find((input) => input.key === 'maturation_threshold_days')?.value;
  const selectedAssetsRaw = inputs.find((input) => input.key === 'selected_assets')?.value;
  const selectedAssets = (selectedAssetsRaw as Array<{ chain: string; asset_identifier: string }>).map((item) => ({
    chain: item.chain,
    assetIdentifier: item.asset_identifier,
  }));

  return {
    maturationThresholdDays: maturationThresholdRaw as number,
    selectedAssets,
  };
}

export function resolveSelectedTokenChains(selectedAssets: SelectedAssetInput[]): SupportedTokenChain[] {
  const metadataEntries = Object.entries(TOKEN_CHAIN_METADATA) as Array<
    [SupportedTokenChain, (typeof TOKEN_CHAIN_METADATA)[SupportedTokenChain]]
  >;
  const tokenChains = new Set<SupportedTokenChain>();

  for (const asset of selectedAssets) {
    for (const [tokenChain, metadata] of metadataEntries) {
      const sameChain = metadata.chain === asset.chain;
      const sameAssetIdentifier = metadata.contractAddress.toLowerCase() === asset.assetIdentifier.toLowerCase();
      if (sameChain && sameAssetIdentifier) {
        tokenChains.add(tokenChain);
      }
    }
  }

  return [...tokenChains];
}
