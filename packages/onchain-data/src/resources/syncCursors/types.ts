/**
 * Sync cursor record tracking the highest ingested block
 * for a given (chain, token) pair.
 */
export type SyncCursor = {
  chainId: string;
  tokenAddress: string;
  cursorBlock: number;
  updatedAt: string;
};
