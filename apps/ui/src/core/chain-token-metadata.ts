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
  contractAddress: string
  label: string
  iconUrl: string
}

const CHAIN_META: Record<string, ChainDisplayMeta> = {
  "1": {
    label: "Ethereum",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  },
}

const TOKEN_META: Record<string, TokenDisplayMeta> = {
  "1:0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85": {
    chainId: "1",
    contractAddress: "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85",
    label: "FET.ai",
    iconUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85/logo.png",
  },
}

export function getChainMeta(chainId: string): ChainDisplayMeta | undefined {
  return CHAIN_META[chainId]
}

export function getTokenMeta(
  chainId: string,
  contractAddress: string
): TokenDisplayMeta | undefined {
  return TOKEN_META[`${chainId}:${contractAddress}`]
}
