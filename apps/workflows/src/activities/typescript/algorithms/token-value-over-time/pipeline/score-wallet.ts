import type { SupportedTokenChain } from '@reputo/onchain-data';

import type { LotScoreDetail, WalletLotsState, WalletScoreDetail } from '../types.js';
import { roundScore } from '../types.js';
import { computeLinearWeight, computeLotAgeDays } from './weight.js';

export function scoreWalletLots(input: {
  lotsState: WalletLotsState;
  selectedTokenChains: SupportedTokenChain[];
  /** Snapshot timestamp as Date or ISO string (e.g. after Temporal serialization). */
  snapshotCreatedAt: Date | string;
  maturationThresholdDays: number;
}): WalletScoreDetail[] {
  const selectedSet = new Set(input.selectedTokenChains);
  const rows: WalletScoreDetail[] = [];

  for (const [walletAddress, lots] of input.lotsState.entries()) {
    const details: LotScoreDetail[] = [];
    let total = 0;

    for (const lot of lots) {
      if (!selectedSet.has(lot.tokenChain)) continue;
      if (lot.amountRemaining <= 0) continue;

      const ageDays = computeLotAgeDays(lot.receivedAt, input.snapshotCreatedAt);
      const weight = computeLinearWeight(ageDays, input.maturationThresholdDays);
      const lotValue = lot.amountRemaining * weight;
      total += lotValue;

      details.push({
        token_chain: lot.tokenChain,
        source_transfer_id: lot.sourceTransferId,
        amount_remaining: roundScore(lot.amountRemaining),
        age_days: roundScore(ageDays),
        weight: roundScore(weight),
        lot_value: roundScore(lotValue),
      });
    }

    rows.push({
      wallet_address: walletAddress,
      token_value: roundScore(total),
      lots: details,
    });
  }

  rows.sort((a, b) => a.wallet_address.localeCompare(b.wallet_address));
  return rows;
}
