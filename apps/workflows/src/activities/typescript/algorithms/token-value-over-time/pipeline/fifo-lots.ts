import type { WalletLot } from '../types.js';

export function pushLot(queue: WalletLot[], lot: WalletLot): void {
  if (lot.amountRemaining <= 0) return;
  queue.push(lot);
}

export function consumeLotsFifo(queue: WalletLot[], amountToConsume: number): number {
  if (amountToConsume <= 0) return 0;

  let remaining = amountToConsume;
  while (queue.length > 0 && remaining > 0) {
    const head = queue[0];
    const consumed = Math.min(head.amountRemaining, remaining);
    head.amountRemaining -= consumed;
    remaining -= consumed;

    if (head.amountRemaining <= 0) {
      queue.shift();
    }
  }

  return remaining;
}
