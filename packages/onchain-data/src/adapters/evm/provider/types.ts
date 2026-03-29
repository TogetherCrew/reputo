import type { RawEvmAssetTransfer } from '../transfers/types.js';

export type AlchemyAssetTransfer = RawEvmAssetTransfer;

export type AlchemyAssetTransfersResponse = {
  transfers: AlchemyAssetTransfer[];
  pageKey?: string;
};

export type AlchemyBlockResponse = {
  number: string;
  hash: string;
  timestamp: string;
};

export type JsonRpcResponse<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};
