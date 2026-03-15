import type { DataSource } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenTransferRepository } from '../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../../src/db/repos/token-transfer-repo.js';
import type { TokenTransferSyncStateRepository } from '../../src/db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../../src/db/repos/token-transfer-sync-state-repo.js';
import type { AlchemyEthereumTokenTransferProvider } from '../../src/providers/ethereum/alchemy-ethereum-token-transfer-provider.js';
import type { AlchemyAssetTransfer } from '../../src/providers/ethereum/alchemy-types.js';
import { DefaultSyncTokenTransfersService } from '../../src/services/sync-token-transfers-service.js';
import { SupportedTokenChain, TOKEN_TRANSFER_START_BLOCKS, TransferDirection } from '../../src/shared/index.js';

const FET_START_BLOCK = TOKEN_TRANSFER_START_BLOCKS[SupportedTokenChain.FET_ETHEREUM];
const FET_START_BLOCK_NUM = parseInt(FET_START_BLOCK, 16);

function blockToHex(n: number): string {
  return `0x${n.toString(16)}`;
}

import { closeTestDataSource, createTestDataSource } from '../utils/db-helpers.js';
import { createMockAlchemyTransfer } from '../utils/mock-helpers.js';

describe('Sync Flow Integration', () => {
  let ds: DataSource;
  let transferRepo: TokenTransferRepository;
  let syncStateRepo: TokenTransferSyncStateRepository;
  const fixedClock = () => '2024-01-15T12:00:00.000Z';

  beforeEach(async () => {
    ds = await createTestDataSource();
    transferRepo = createTokenTransferRepository(ds);
    syncStateRepo = createTokenTransferSyncStateRepository(ds);
  });

  afterEach(async () => {
    await closeTestDataSource(ds);
  });

  function makeProvider(
    toBlock: number,
    batchesFn: () => AsyncGenerator<{ items: AlchemyAssetTransfer[]; lastBlock: string }>,
  ): AlchemyEthereumTokenTransferProvider {
    return {
      getToBlock: vi.fn().mockResolvedValue(blockToHex(toBlock)),
      fetchTokenTransfers: batchesFn,
    };
  }

  it('first sync writes transfers and creates sync state', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: blockToHex(block1),
        uniqueId: '0xaaa:log:0x0',
        hash: '0xaaa',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: 100,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block2),
        uniqueId: '0xbbb:log:0x1',
        hash: '0xbbb',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x2222222222222222222222222222222222222222',
        value: 200,
      }),
    ];

    async function* batches() {
      yield { items: transfers, lastBlock: blockToHex(block2) };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.insertedCount).toBe(2);
    expect(result.fromBlock).toBe(FET_START_BLOCK);

    const syncState = await syncStateRepo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
    expect(syncState).not.toBeNull();
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(block2));
  });

  it('second sync only fetches new blocks', async () => {
    const lastSynced = FET_START_BLOCK_NUM + 50;
    await syncStateRepo.upsert({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      lastSyncedBlock: blockToHex(lastSynced),
      updatedAt: '2024-01-14T00:00:00.000Z',
    });

    const fetchFn = vi.fn();
    const newBlock = lastSynced;
    const toBlock = FET_START_BLOCK_NUM + 200;
    async function* batches() {
      fetchFn();
      yield {
        items: [
          createMockAlchemyTransfer({
            blockNum: blockToHex(newBlock),
            uniqueId: '0xccc:log:0x0',
            hash: '0xccc',
          }),
        ],
        lastBlock: blockToHex(newBlock),
      };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    const result = await service.sync();
    expect(result.fromBlock).toBe(blockToHex(lastSynced));
    expect(result.toBlock).toBe(blockToHex(toBlock));
    expect(result.insertedCount).toBe(1);
  });

  it('failure inside a batch does not update sync state beyond committed data', async () => {
    const block1 = FET_START_BLOCK_NUM;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfer1 = createMockAlchemyTransfer({
      blockNum: blockToHex(block1),
      uniqueId: '0xfirst:log:0x0',
      hash: '0xfirst',
    });

    let batchIndex = 0;
    async function* batches() {
      yield { items: [transfer1], lastBlock: blockToHex(block1) };
      batchIndex++;
      throw new Error('Provider failure');
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );

    await expect(service.sync()).rejects.toThrow('Provider failure');

    const syncState = await syncStateRepo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
    expect(syncState?.lastSyncedBlock).toBe(blockToHex(block1));
    expect(batchIndex).toBe(1);
  });

  it('synced data can be queried by address with block range and direction', async () => {
    const addr = '0xaaaa000000000000000000000000000000000001';
    const other = '0xbbbb000000000000000000000000000000000002';

    const block1 = FET_START_BLOCK_NUM;
    const block2 = FET_START_BLOCK_NUM + 1;
    const block3 = FET_START_BLOCK_NUM + 2;
    const toBlock = FET_START_BLOCK_NUM + 100;
    const transfers = [
      createMockAlchemyTransfer({
        blockNum: blockToHex(block1),
        uniqueId: '0xout1:log:0x0',
        hash: '0xout1',
        from: addr,
        to: other,
        value: 10,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block2),
        uniqueId: '0xin1:log:0x0',
        hash: '0xin1',
        from: other,
        to: addr,
        value: 20,
      }),
      createMockAlchemyTransfer({
        blockNum: blockToHex(block3),
        uniqueId: '0xout2:log:0x0',
        hash: '0xout2',
        from: addr,
        to: other,
        value: 30,
      }),
    ];

    async function* batches() {
      yield { items: transfers, lastBlock: blockToHex(block3) };
    }

    const provider = makeProvider(toBlock, batches);
    const service = new DefaultSyncTokenTransfersService(
      SupportedTokenChain.FET_ETHEREUM,
      ds,
      transferRepo,
      syncStateRepo,
      provider,
      fixedClock,
    );
    await service.sync();

    const all = await transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
    });
    expect(all).toHaveLength(3);

    const inbound = await transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      direction: TransferDirection.INBOUND,
    });
    expect(inbound).toHaveLength(1);
    expect(inbound[0].transactionHash).toBe('0xin1');

    const outbound = await transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      direction: TransferDirection.OUTBOUND,
    });
    expect(outbound).toHaveLength(2);

    const rangeFiltered = await transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      fromBlock: blockToHex(block1),
      toBlock: blockToHex(block2),
    });
    expect(rangeFiltered).toHaveLength(2);

    const noResults = await transferRepo.findByAddress({
      tokenChain: SupportedTokenChain.FET_ETHEREUM,
      address: addr,
      fromBlock: blockToHex(FET_START_BLOCK_NUM + 1_000_000),
      toBlock: blockToHex(FET_START_BLOCK_NUM + 2_000_000),
    });
    expect(noResults).toHaveLength(0);
  });
});
