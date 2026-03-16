import type { OrderedTransferEvent, ReplayStats, WalletLotsState } from '../types.js';
import { applyTransfer } from './apply-transfer.js';

export function replayTransfers(
  state: WalletLotsState,
  transfers: OrderedTransferEvent[],
  targetWalletSet: Set<string>,
): ReplayStats {
  const stats: ReplayStats = {
    processed: 0,
    skippedZeroAmount: 0,
    skippedSelfTransfers: 0,
  };

  for (const transfer of transfers) {
    applyTransfer(state, transfer, targetWalletSet, stats);
  }

  return stats;
}
