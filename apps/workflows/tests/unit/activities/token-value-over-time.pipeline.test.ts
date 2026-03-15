import { SupportedTokenChain } from '@reputo/onchain-data';
import { describe, expect, it } from 'vitest';

import {
  replayTransfers,
  scoreWalletLots,
} from '../../../src/activities/typescript/algorithms/token-value-over-time/pipeline/index.js';
import type {
  OrderedTransferEvent,
  WalletLotsState,
} from '../../../src/activities/typescript/algorithms/token-value-over-time/types.js';

describe('token-value-over-time pipeline', () => {
  it('consumes lots in FIFO order and computes linear maturation weights', () => {
    const wallet = '0x0000000000000000000000000000000000000001';
    const state: WalletLotsState = new Map([[wallet, []]]);
    const transfers: OrderedTransferEvent[] = [
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x1',
        transactionHash: '0xaaa',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000010',
        toAddress: wallet,
        amount: 10,
        blockTimestamp: '2026-01-01T00:00:00.000Z',
      },
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x2',
        transactionHash: '0xbbb',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000020',
        toAddress: wallet,
        amount: 6,
        blockTimestamp: '2026-02-01T00:00:00.000Z',
      },
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x3',
        transactionHash: '0xccc',
        logIndex: 0,
        fromAddress: wallet,
        toAddress: '0x0000000000000000000000000000000000000030',
        amount: 12,
        blockTimestamp: '2026-03-01T00:00:00.000Z',
      },
    ];

    const stats = replayTransfers(state, transfers, new Set([wallet]));
    expect(stats).toEqual({
      processed: 3,
      skippedZeroAmount: 0,
      skippedSelfTransfers: 0,
    });

    const results = scoreWalletLots({
      lotsState: state,
      selectedTokenChains: [SupportedTokenChain.FET_ETHEREUM],
      snapshotCreatedAt: new Date('2026-04-01T00:00:00.000Z'),
      maturationThresholdDays: 90,
    });

    expect(results).toHaveLength(1);
    expect(results[0].wallet_address).toBe(wallet);
    expect(results[0].lots).toHaveLength(1);

    const [lot] = results[0].lots;
    expect(lot.amount_remaining).toBe(4);
    expect(lot.weight).toBeCloseTo(59 / 90, 4);
    expect(results[0].token_value).toBeCloseTo((4 * 59) / 90, 4);
  });

  it('ignores self-transfers and zero-amount transfers', () => {
    const wallet = '0x0000000000000000000000000000000000000001';
    const state: WalletLotsState = new Map([[wallet, []]]);
    const transfers: OrderedTransferEvent[] = [
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x1',
        transactionHash: '0xaaa',
        logIndex: 0,
        fromAddress: wallet,
        toAddress: wallet,
        amount: 100,
        blockTimestamp: '2026-01-01T00:00:00.000Z',
      },
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x2',
        transactionHash: '0xbbb',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000002',
        toAddress: wallet,
        amount: 0,
        blockTimestamp: '2026-01-02T00:00:00.000Z',
      },
    ];

    const stats = replayTransfers(state, transfers, new Set([wallet]));

    expect(stats.processed).toBe(2);
    expect(stats.skippedSelfTransfers).toBe(1);
    expect(stats.skippedZeroAmount).toBe(1);
    expect(state.get(wallet)).toEqual([]);
  });

  it('preserves FIFO semantics when replaying multiple batches', () => {
    const wallet = '0x0000000000000000000000000000000000000001';
    const state: WalletLotsState = new Map([[wallet, []]]);
    const batchOne: OrderedTransferEvent[] = [
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x1',
        transactionHash: '0xaaa',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000010',
        toAddress: wallet,
        amount: 10,
        blockTimestamp: '2026-01-01T00:00:00.000Z',
      },
    ];
    const batchTwo: OrderedTransferEvent[] = [
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x2',
        transactionHash: '0xbbb',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000020',
        toAddress: wallet,
        amount: 5,
        blockTimestamp: '2026-01-02T00:00:00.000Z',
      },
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x3',
        transactionHash: '0xccc',
        logIndex: 0,
        fromAddress: wallet,
        toAddress: '0x0000000000000000000000000000000000000030',
        amount: 12,
        blockTimestamp: '2026-01-03T00:00:00.000Z',
      },
    ];

    replayTransfers(state, batchOne, new Set([wallet]));
    replayTransfers(state, batchTwo, new Set([wallet]));

    const remainingLots = state.get(wallet);
    expect(remainingLots).toHaveLength(1);
    expect(remainingLots?.[0].sourceTransferId).toBe('fet-ethereum:0xbbb:0');
    expect(remainingLots?.[0].amountRemaining).toBe(3);
  });

  it('scoreWalletLots works when snapshotCreatedAt is ISO string (e.g. after Temporal serialization)', () => {
    const wallet = '0x0000000000000000000000000000000000000001';
    const state: WalletLotsState = new Map([[wallet, []]]);
    const transfers: OrderedTransferEvent[] = [
      {
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        blockNumber: '0x1',
        transactionHash: '0xaaa',
        logIndex: 0,
        fromAddress: '0x0000000000000000000000000000000000000010',
        toAddress: wallet,
        amount: 10,
        blockTimestamp: '2026-01-01T00:00:00.000Z',
      },
    ];
    replayTransfers(state, transfers, new Set([wallet]));

    const resultsWithDate = scoreWalletLots({
      lotsState: state,
      selectedTokenChains: [SupportedTokenChain.FET_ETHEREUM],
      snapshotCreatedAt: new Date('2026-04-01T00:00:00.000Z'),
      maturationThresholdDays: 90,
    });
    const resultsWithString = scoreWalletLots({
      lotsState: state,
      selectedTokenChains: [SupportedTokenChain.FET_ETHEREUM],
      snapshotCreatedAt: '2026-04-01T00:00:00.000Z',
      maturationThresholdDays: 90,
    });

    expect(resultsWithString).toHaveLength(resultsWithDate.length);
    expect(resultsWithString[0].wallet_address).toBe(resultsWithDate[0].wallet_address);
    expect(resultsWithString[0].token_value).toBeCloseTo(resultsWithDate[0].token_value, 6);
  });
});
