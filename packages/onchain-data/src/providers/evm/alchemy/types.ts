import type { TransferEvent } from '../../../resources/transfers/types.js';

/** Standard JSON-RPC request envelope */
export type JsonRpcRequest = {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
};

/** JSON-RPC error object */
export type JsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
};

/** Standard JSON-RPC response envelope */
export type JsonRpcResponse<T> = {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: JsonRpcError;
};

/** Raw contract details in an Alchemy transfer */
export type AlchemyRawContract = {
  value: string | null;
  address: string | null;
  decimal: string | null;
};

/** Metadata attached to an Alchemy transfer */
export type AlchemyTransferMetadata = {
  blockTimestamp: string;
};

/** Single transfer returned by `alchemy_getAssetTransfers` */
export type AlchemyTransfer = {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  erc721TokenId: string | null;
  erc1155Metadata: unknown | null;
  tokenId: string | null;
  asset: string | null;
  category: string;
  rawContract: AlchemyRawContract;
  metadata: AlchemyTransferMetadata;
};

/** Result payload of `alchemy_getAssetTransfers` */
export type AlchemyAssetTransfersResult = {
  transfers: AlchemyTransfer[];
  pageKey?: string;
};

/** Parameters for `alchemy_getAssetTransfers` */
export type AlchemyAssetTransfersParams = {
  fromBlock: string;
  toBlock: string;
  contractAddresses: string[];
  category: string[];
  excludeZeroValue: boolean;
  maxCount: string;
  order?: 'asc' | 'desc';
  pageKey?: string;
};

/** Minimal block result from `eth_getBlockByNumber` */
export type AlchemyBlockResult = {
  number: string;
  hash: string;
  timestamp: string;
};

/** Input for fetching ERC-20 transfers */
export type FetchTransfersInput = {
  chain: string;
  tokenContractAddress: string;
  fromBlock: number;
  requestedToBlock: number;
};

/** Result of fetching ERC-20 transfers */
export type FetchTransfersResult = {
  transfers: TransferEvent[];
  effectiveToBlock: number;
};
