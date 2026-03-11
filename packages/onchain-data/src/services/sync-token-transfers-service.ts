import type { TokenTransferRepository } from '../db/repos/token-transfer-repo.js';
import { createTokenTransferRepository } from '../db/repos/token-transfer-repo.js';
import type { TokenTransferSyncStateRepository } from '../db/repos/token-transfer-sync-state-repo.js';
import { createTokenTransferSyncStateRepository } from '../db/repos/token-transfer-sync-state-repo.js';
import type { Database } from '../db/sqlite.js';
import { createDatabase } from '../db/sqlite.js';
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
  close(): void;
}

export type CreateSyncTokenTransfersServiceInput = {
  tokenChain: SupportedTokenChain;
  dbPath: string;
  alchemyApiKey: string;
};

export function createSyncTokenTransfersService(
  input: CreateSyncTokenTransfersServiceInput,
): SyncTokenTransfersService {
  const db = createDatabase(input.dbPath);
  const tokenTransferRepo = createTokenTransferRepository(db.sqlite);
  const syncStateRepo = createTokenTransferSyncStateRepository(db.sqlite);
  const provider = createAlchemyEthereumTokenTransferProvider(input.alchemyApiKey);

  return new DefaultSyncTokenTransfersService(input.tokenChain, db, tokenTransferRepo, syncStateRepo, provider);
}

export class DefaultSyncTokenTransfersService implements SyncTokenTransfersService {
  constructor(
    private readonly tokenChain: SupportedTokenChain,
    private readonly db: Database,
    private readonly tokenTransferRepo: TokenTransferRepository,
    private readonly syncStateRepo: TokenTransferSyncStateRepository,
    private readonly provider: AlchemyEthereumTokenTransferProvider,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async sync(): Promise<SyncTokenTransfersResult> {
    const metadata = TOKEN_CHAIN_METADATA[this.tokenChain];
    const { fromBlock, toBlock } = await this.resolveSyncRange(metadata.startBlock);

    if (compareHexBlocks(fromBlock, toBlock) > 0) {
      return {
        tokenChain: this.tokenChain,
        fromBlock,
        toBlock,
        insertedCount: 0,
      };
    }

    let insertedCount = 0;

    for await (const batch of this.provider.fetchTokenTransfers({
      contractAddress: metadata.contractAddress,
      fromBlock,
      toBlock,
    })) {
      insertedCount += this.persistBatch(batch);
    }

    return {
      tokenChain: this.tokenChain,
      fromBlock,
      toBlock,
      insertedCount,
    };
  }

  close(): void {
    this.db.close();
  }

  private async resolveSyncRange(startBlock: string): Promise<{
    fromBlock: string;
    toBlock: string;
  }> {
    console.log(startBlock);
    const syncState = this.syncStateRepo.findByTokenChain(this.tokenChain);
    const fromBlock = syncState ? normalizeHexBlock(syncState.lastSyncedBlock) : normalizeHexBlock(startBlock);
    console.log(syncState, fromBlock);
    const toBlock = normalizeHexBlock(await this.provider.getToBlock());
    return { fromBlock, toBlock };
  }

  private persistBatch(batch: { items: AlchemyAssetTransfer[]; lastBlock: string }): number {
    const normalizedItems = batch.items.map((transfer) =>
      normalizeAlchemyEthereumTransfer({
        tokenChain: this.tokenChain,
        transfer,
      }),
    );

    return this.db.transaction(() => {
      const insertedCount = this.tokenTransferRepo.insertMany(normalizedItems);

      this.syncStateRepo.upsert({
        tokenChain: this.tokenChain,
        lastSyncedBlock: normalizeHexBlock(batch.lastBlock),
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
