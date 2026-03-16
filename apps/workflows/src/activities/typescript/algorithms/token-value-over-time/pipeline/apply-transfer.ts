import type { OrderedTransferEvent, ReplayStats, WalletLotsState } from '../types.js';
import { consumeLotsFifo, pushLot } from './fifo-lots.js';

export function applyTransfer(
  state: WalletLotsState,
  transfer: OrderedTransferEvent,
  targetWalletSet: Set<string>,
  stats: ReplayStats,
): void {
  stats.processed += 1;

  if (transfer.amount === 0) {
    stats.skippedZeroAmount += 1;
    return;
  }

  const from = transfer.fromAddress;
  const to = transfer.toAddress;

  if (from && to && from === to) {
    stats.skippedSelfTransfers += 1;
    return;
  }

  if (from && targetWalletSet.has(from)) {
    const senderLots = state.get(from);
    if (senderLots) {
      consumeLotsFifo(senderLots, transfer.amount);
    }
  }

  if (to && targetWalletSet.has(to)) {
    const receiverLots = state.get(to);
    if (receiverLots) {
      pushLot(receiverLots, {
        assetKey: transfer.assetKey,
        amountRemaining: transfer.amount,
        receivedAt: transfer.blockTimestamp,
        sourceTransferId: `${transfer.assetKey}:${transfer.transactionHash}:${transfer.logIndex}`,
      });
    }
  }
}
