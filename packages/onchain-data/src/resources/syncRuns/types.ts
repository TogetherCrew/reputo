/** Possible states of a sync run */
export type SyncRunStatus = 'started' | 'succeeded' | 'failed' | 'noop';

/** A single sync-run record tracking one execution of the sync pipeline. */
export type SyncRun = {
  id?: number;
  chainId: string;
  tokenAddress: string;
  requestedFromBlock: number;
  requestedToBlock: number;
  effectiveToBlock: number | null;
  status: SyncRunStatus;
  errorSummary: string | null;
  startedAt: string;
  completedAt: string | null;
};
