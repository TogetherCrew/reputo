import type { DataSource } from 'typeorm';
import type { TokenTransferRepository } from '../db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../db/repos/token-transfer-repo.js';
import type { TokenTransferSyncStateRepository } from '../db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../db/repos/token-transfer-sync-state-repo.js';
import { createDataSource } from '../db/sqlite.js';
import type { AlchemyEthereumTokenTransferProvider } from '../providers/ethereum/alchemy-ethereum-token-transfer-provider.js';
import { createAlchemyEthereumTokenTransferProvider } from '../providers/ethereum/alchemy-ethereum-token-transfer-provider.js';
import type { AlchemyAssetTransfer } from '../providers/ethereum/alchemy-types.js';
import {
  compareHexBlocks,
  normalizeEvmAddress,
  normalizeHexBlock,
  type SupportedTokenChain,
  TOKEN_CHAIN_METADATA,
  type TokenTransferRecord,
} from '../shared/index.js';

export type SyncTokenTransfersResult = {
  tokenChain: SupportedTokenChain;
  fromBlock: string;
  toBlock: string;
  insertedCount: number;
};

export interface SyncTokenTransfersService {
  sync(): Promise<SyncTokenTransfersResult>;
  close(): Promise<void>;
}

export type CreateSyncTokenTransfersServiceInput = {
  tokenChain: SupportedTokenChain;
  dbPath: string;
  alchemyApiKey: string;
};

export async function createSyncTokenTransfersService(
  input: CreateSyncTokenTransfersServiceInput,
): Promise<SyncTokenTransfersService> {
  const dataSource = await createDataSource(input.dbPath);
  const tokenTransferRepo = createTokenTransferRepository(dataSource);
  const syncStateRepo = createTokenTransferSyncStateRepository(dataSource);
  const provider = createAlchemyEthereumTokenTransferProvider(input.alchemyApiKey);

  return new DefaultSyncTokenTransfersService(input.tokenChain, dataSource, tokenTransferRepo, syncStateRepo, provider);
}

export class DefaultSyncTokenTransfersService implements SyncTokenTransfersService {
  constructor(
    private readonly tokenChain: SupportedTokenChain,
    private readonly dataSource: DataSource,
    private readonly tokenTransferRepo: TokenTransferRepository,
    private readonly syncStateRepo: TokenTransferSyncStateRepository,
    private readonly provider: AlchemyEthereumTokenTransferProvider,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async sync(): Promise<SyncTokenTransfersResult> {
    const metadata = TOKEN_CHAIN_METADATA[this.tokenChain];
    const { fromBlock, toBlock } = await this.resolveSyncRange(metadata.startBlock);

    if (compareHexBlocks(fromBlock, toBlock) > 0) {
      return { tokenChain: this.tokenChain, fromBlock, toBlock, insertedCount: 0 };
    }

    let insertedCount = 0;

    for await (const batch of this.provider.fetchTokenTransfers({
      contractAddress: metadata.contractAddress,
      fromBlock,
      toBlock,
    })) {
      insertedCount += await this.persistBatch(batch);
    }

    return { tokenChain: this.tokenChain, fromBlock, toBlock, insertedCount };
  }

  async close(): Promise<void> {
    await this.dataSource.destroy();
  }

  private async resolveSyncRange(startBlock: string): Promise<{
    fromBlock: string;
    toBlock: string;
  }> {
    const syncState = await this.syncStateRepo.findByTokenChain(this.tokenChain);
    const fromBlock = syncState ? normalizeHexBlock(syncState.lastSyncedBlock) : normalizeHexBlock(startBlock);
    const toBlock = normalizeHexBlock(await this.provider.getToBlock());
    return { fromBlock, toBlock };
  }

  private async persistBatch(batch: { items: AlchemyAssetTransfer[]; lastBlock: string }): Promise<number> {
    const normalizedItems = batch.items.map((transfer) =>
      normalizeAlchemyEthereumTransfer({
        tokenChain: this.tokenChain,
        transfer,
      }),
    );

    const lastItem = normalizedItems.length > 0 ? normalizedItems[normalizedItems.length - 1] : null;

    return this.dataSource.transaction(async () => {
      const insertedCount = await this.tokenTransferRepo.insertMany(normalizedItems);

      await this.syncStateRepo.upsert({
        tokenChain: this.tokenChain,
        lastSyncedBlock: normalizeHexBlock(batch.lastBlock),
        lastTransactionHash: lastItem?.transactionHash ?? null,
        lastLogIndex: lastItem?.logIndex ?? null,
        updatedAt: this.clock(),
      });

      return insertedCount;
    });
  }
}

export function normalizeAlchemyEthereumTransfer(input: {
  tokenChain: SupportedTokenChain;
  transfer: AlchemyAssetTransfer;
}): TokenTransferRecord {
  const logIndex = parseLogIndex(input.transfer.uniqueId);
  return {
    id: `${input.tokenChain}:${input.transfer.hash}:${logIndex}`,
    tokenChain: input.tokenChain,
    blockNumber: normalizeHexBlock(input.transfer.blockNum),
    transactionHash: input.transfer.hash,
    logIndex,
    fromAddress: input.transfer.from ? normalizeEvmAddress(input.transfer.from) : null,
    toAddress: input.transfer.to ? normalizeEvmAddress(input.transfer.to) : null,
    amount: String(input.transfer.value ?? '0'),
    blockTimestamp: input.transfer.metadata?.blockTimestamp ?? null,
  };
}

function parseLogIndex(uniqueId: string): number {
  const match = uniqueId.match(/:log:(0x[0-9a-fA-F]+|\d+)$/);
  if (!match) {
    throw new Error(`Cannot parse logIndex from uniqueId: ${uniqueId}`);
  }
  return Number(match[1]);
}
