import type { FetchTransfersInput, FetchTransfersResult } from '../providers/evm/alchemy/types.js';
import type { OnchainDataDb } from '../shared/types/db.js';

/** Provider-agnostic interface matching the ERC-20 transfer fetch contract. */
export type TransferProvider = {
  fetchErc20Transfers: (input: FetchTransfersInput) => Promise<FetchTransfersResult>;
};

/** Dependencies required by the sync service. */
export type SyncServiceDeps = {
  provider: TransferProvider;
  db: OnchainDataDb;
};

/** Runtime input for a single token-transfer sync invocation. */
export type SyncTokenTransfersInput = {
  chain: string;
  tokenContractAddress: string;
  initialStartBlock: number;
};

/** Outcome of a single sync invocation. */
export type SyncTokenTransfersResult = {
  status: 'succeeded' | 'failed' | 'noop';
  syncRunId: number;
  requestedFromBlock: number;
  requestedToBlock: number;
  effectiveToBlock: number | null;
  transferCount: number;
  error?: string;
};
