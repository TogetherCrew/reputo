/** Synced with reputation-algorithms registry token_value_over_time selected_assets. */
export const OnchainAssets = {
  fet_ethereum: {
    chain: 'ethereum',
    symbol: 'FET',
    assetIdentifier: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
    startblock: '0xa7d13c',
    provider: 'Alchemy',
  },
  fet_cardano: {
    chain: 'cardano',
    symbol: 'FET',
    assetIdentifier: 'e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9',
    startblock: '0xa7d13c',
    provider: 'Alchemy',
  },
  fet_cosmos: {
    chain: 'cosmos',
    symbol: 'FET',
    assetIdentifier: 'afet',
    startblock: '0xa7d13c',
    provider: 'Alchemy',
  },
} as const;

export type OnchainAsset = (typeof OnchainAssets)[keyof typeof OnchainAssets];
export type AssetKey = keyof typeof OnchainAssets;
export const ONCHAIN_ASSET_KEYS = Object.keys(OnchainAssets) as AssetKey[];
export const ONCHAIN_ASSETS = Object.values(OnchainAssets);
