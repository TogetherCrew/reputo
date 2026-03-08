export { type AlchemyClient, createAlchemyClient } from './client.js';
export {
  ALCHEMY_DEFAULTS,
  type AlchemyChainConfig,
  type AlchemyConfig,
  type AlchemyConfigInput,
  type AlchemyRetryConfig,
  CHAIN_IDS,
  ETHEREUM_FET_EXAMPLE,
  resolveAlchemyConfig,
} from './config.js';
export { fromHex, getFinalizedBlockNumber, toHex } from './finality.js';
export { normalizeAlchemyTransfer } from './normalize.js';
export { fetchErc20Transfers } from './transfers.js';
export type {
  AlchemyAssetTransfersParams,
  AlchemyAssetTransfersResult,
  AlchemyBlockResult,
  AlchemyRawContract,
  AlchemyTransfer,
  AlchemyTransferMetadata,
  FetchTransfersInput,
  FetchTransfersResult,
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
} from './types.js';

import { createAlchemyClient } from './client.js';
import type { AlchemyConfigInput } from './config.js';
import { resolveAlchemyConfig } from './config.js';
import { fetchErc20Transfers } from './transfers.js';
import type { FetchTransfersInput, FetchTransfersResult } from './types.js';

/** High-level Alchemy provider with pre-wired client */
export type AlchemyProvider = {
  fetchErc20Transfers: (input: FetchTransfersInput) => Promise<FetchTransfersResult>;
};

/** Create a ready-to-use Alchemy provider */
export function createAlchemyProvider(input: AlchemyConfigInput): AlchemyProvider {
  const config = resolveAlchemyConfig(input);
  const client = createAlchemyClient(config);

  return {
    fetchErc20Transfers: (transferInput) => fetchErc20Transfers(client, transferInput),
  };
}
