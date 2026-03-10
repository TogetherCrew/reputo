import type { SupportedTokenChain } from '../enums/index.js';

export type TokenTransferRecord = {
  id: string;
  tokenChain: SupportedTokenChain;
  contractAddress: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string;
  blockTimestamp: string | null;
  rawJson: string;
  createdAt: string;
};

export type TokenTransferSyncState = {
  tokenChain: SupportedTokenChain;
  lastSyncedBlock: number;
  updatedAt: string;
};
