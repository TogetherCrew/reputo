import type { DataSource } from 'typeorm';
import type { AssetTransferRepository } from '../db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository } from '../db/repos/asset-transfer-repo.js';
import type { AssetTransferSyncStateRepository } from '../db/repos/asset-transfer-sync-state-repo.js';
import { createAssetTransferSyncStateRepository } from '../db/repos/asset-transfer-sync-state-repo.js';
import { createDataSource } from '../db/sqlite.js';
import type { AlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { createAlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import type { AlchemyAssetTransfer } from '../providers/ethereum/alchemy-types.js';
import {
  type AssetKey,
  type AssetTransferRecord,
  compareHexBlocks,
  normalizeEvmAddress,
  normalizeHexBlock,
  OnchainAssets,
} from '../shared/index.js';

export type SyncAssetTransfersResult = {
  assetKey: AssetKey;
  fromBlock: string;
  toBlock: string;
  insertedCount: number;
};

export interface SyncAssetTransfersService {
  sync(): Promise<SyncAssetTransfersResult>;
  close(): Promise<void>;
}

export type CreateSyncAssetTransfersServiceInput = {
  assetKey: AssetKey;
  dbPath: string;
  alchemyApiKey: string;
};

export async function createSyncAssetTransfersService(
  input: CreateSyncAssetTransfersServiceInput,
): Promise<SyncAssetTransfersService> {
  const dataSource = await createDataSource(input.dbPath);
  const assetTransferRepo = createAssetTransferRepository(dataSource);
  const syncStateRepo = createAssetTransferSyncStateRepository(dataSource);
  const provider = createAlchemyEthereumAssetTransferProvider(input.alchemyApiKey);

  return new DefaultSyncAssetTransfersService(input.assetKey, dataSource, assetTransferRepo, syncStateRepo, provider);
}

export class DefaultSyncAssetTransfersService implements SyncAssetTransfersService {
  constructor(
    private readonly assetKey: AssetKey,
    private readonly dataSource: DataSource,
    private readonly assetTransferRepo: AssetTransferRepository,
    private readonly syncStateRepo: AssetTransferSyncStateRepository,
    private readonly provider: AlchemyEthereumAssetTransferProvider,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async sync(): Promise<SyncAssetTransfersResult> {
    const asset = OnchainAssets[this.assetKey];
    if (asset.provider !== 'Alchemy') {
      return {
        assetKey: this.assetKey,
        fromBlock: asset.startblock,
        toBlock: asset.startblock,
        insertedCount: 0,
      };
    }
    const { fromBlock, toBlock } = await this.resolveSyncRange(asset.startblock);

    if (compareHexBlocks(fromBlock, toBlock) > 0) {
      return {
        assetKey: this.assetKey,
        fromBlock,
        toBlock,
        insertedCount: 0,
      };
    }

    let insertedCount = 0;

    for await (const batch of this.provider.fetchAssetTransfers({
      assetIdentifier: asset.assetIdentifier,
      fromBlock,
      toBlock,
    })) {
      insertedCount += await this.persistBatch(batch);
    }

    return { assetKey: this.assetKey, fromBlock, toBlock, insertedCount };
  }

  async close(): Promise<void> {
    await this.dataSource.destroy();
  }

  private async resolveSyncRange(startBlock: string): Promise<{ fromBlock: string; toBlock: string }> {
    const syncState = await this.syncStateRepo.findByAssetKey(this.assetKey);
    const fromBlock = syncState ? normalizeHexBlock(syncState.lastSyncedBlock) : normalizeHexBlock(startBlock);
    const toBlock = normalizeHexBlock(await this.provider.getToBlock());
    return { fromBlock, toBlock };
  }

  private async persistBatch(batch: { items: AlchemyAssetTransfer[]; lastBlock: string }): Promise<number> {
    const asset = OnchainAssets[this.assetKey];
    const normalizedItems = batch.items.map((transfer) =>
      normalizeAlchemyEthereumTransfer({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
        transfer,
      }),
    );

    const lastItem = normalizedItems.length > 0 ? normalizedItems[normalizedItems.length - 1] : null;

    return this.dataSource.transaction(async () => {
      const insertedCount = await this.assetTransferRepo.insertMany(normalizedItems);

      await this.syncStateRepo.upsert({
        chain: asset.chain,
        assetIdentifier: asset.assetIdentifier,
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
  chain: string;
  assetIdentifier: string;
  transfer: AlchemyAssetTransfer;
}): AssetTransferRecord {
  const logIndex = parseLogIndex(input.transfer.uniqueId);
  return {
    chain: input.chain,
    assetIdentifier: input.assetIdentifier,
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
