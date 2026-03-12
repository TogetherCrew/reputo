/**
 * Display metadata for chains and tokens.
 *
 * Icons are a presentation concern and never alter stored runtime inputs,
 * API payload structure, validation keys, or algorithm definition identity.
 */

export interface ChainDisplayMeta {
  label: string
  iconUrl: string
}

export interface TokenDisplayMeta {
  chainId: string
  assetIdentifier: string
  label: string
  iconUrl: string
  explorerUrl?: string
  explorerName?: string
}

const CHAIN_META: Record<string, ChainDisplayMeta> = {
  ethereum: {
    label: "Ethereum",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  },
  cardano: {
    label: "Cardano",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cardano/info/logo.png",
  },
  cosmos: {
    label: "Cosmos",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/info/logo.png",
  },
}

const TOKEN_META: Record<string, TokenDisplayMeta> = {
  "ethereum:0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85": {
    chainId: "ethereum",
    assetIdentifier: "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
    label: "FET",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85/logo.png",
    explorerUrl:
      "https://etherscan.io/token/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
    explorerName: "Etherscan",
  },
  "cardano:e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9": {
    chainId: "cardano",
    assetIdentifier: "e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9",
    label: "FET",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85/logo.png",
    explorerUrl:
      "https://cardanoscan.io/token/e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9",
    explorerName: "Cardanoscan",
  },
  "cosmos:afet": {
    chainId: "cosmos",
    assetIdentifier: "afet",
    label: "FET",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85/logo.png",
    explorerUrl: "https://www.mintscan.io/fetchai",
    explorerName: "Mintscan",
  },
}

export function getChainMeta(chainId: string): ChainDisplayMeta | undefined {
  return CHAIN_META[chainId]
}

export function getTokenMeta(
  chainId: string,
  assetIdentifier: string
): TokenDisplayMeta | undefined {
  return TOKEN_META[`${chainId}:${assetIdentifier}`]
}
