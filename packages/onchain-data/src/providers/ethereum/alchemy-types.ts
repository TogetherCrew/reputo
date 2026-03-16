export type AlchemyAssetTransfer = {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  rawContract: {
    value: string | null;
    address: string | null;
    decimal: string | null;
  };
  metadata?: {
    blockTimestamp?: string;
  };
};

export type AlchemyAssetTransfersResponse = {
  transfers: AlchemyAssetTransfer[];
  pageKey?: string;
};

export type AlchemyBlockResponse = {
  number: string;
  hash: string;
  timestamp: string;
};
