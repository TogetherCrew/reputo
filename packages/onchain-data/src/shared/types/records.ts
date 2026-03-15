export type AssetTransferRecord = {
  chain: string;
  assetIdentifier: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string;
  blockTimestamp: string | null;
};

export type AssetTransferSyncState = {
  chain: string;
  assetIdentifier: string;
  lastSyncedBlock: string;
  lastTransactionHash?: string | null;
  lastLogIndex?: number | null;
  updatedAt: string;
};
