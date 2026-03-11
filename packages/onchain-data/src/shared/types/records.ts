import type { SupportedTokenChain } from '../enums/index.js';

export type TokenTransferRecord = {
  id: string;
  tokenChain: SupportedTokenChain;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string;
  blockTimestamp: string | null;
};

export type TokenTransferSyncState = {
  tokenChain: SupportedTokenChain;
  lastSyncedBlock: string;
  updatedAt: string;
};
