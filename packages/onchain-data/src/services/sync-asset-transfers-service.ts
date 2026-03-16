import type { DataSource } from 'typeorm';
import type { AssetTransferRepository } from '../db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository } from '../db/repos/asset-transfer-repo.js';
import type { AssetTransferSyncStateRepository } from '../db/repos/asset-transfer-sync-state-repo.js';
import { createAssetTransferSyncStateRepository } from '../db/repos/asset-transfer-sync-state-repo.js';
import type { AssetTransferEntity } from '../db/schema.js';
import { createDataSource } from '../db/sqlite.js';
import type { AlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { createAlchemyEthereumAssetTransferProvider } from '../providers/ethereum/alchemy-ethereum-asset-transfer-provider.js';
import { type AssetKey, compareHexBlocks, normalizeHexBlock, OnchainAssets } from '../shared/index.js';

const BUFFER_ITEM_COUNT = 10_000;

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
    let bufferedItems: AssetTransferEntity[] = [];
    let bufferedPageCount = 0;
    let bufferedLastBlock: string | null = null;

    for await (const page of this.provider.fetchAssetTransfers({
      assetKey: this.assetKey,
      assetIdentifier: asset.assetIdentifier,
      fromBlock,
      toBlock,
    })) {
      insertedCount += page.items.length;
      bufferedItems.push(...page.items);
      bufferedPageCount += 1;
      bufferedLastBlock = page.lastBlock;

      if (bufferedItems.length >= BUFFER_ITEM_COUNT) {
        await this.persistBufferedItems(bufferedItems, bufferedLastBlock);
        bufferedItems = [];
        bufferedPageCount = 0;
        bufferedLastBlock = null;
      }
    }

    if (bufferedPageCount > 0) {
      await this.persistBufferedItems(bufferedItems, bufferedLastBlock);
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

  private async persistBufferedItems(items: AssetTransferEntity[], lastBlock: string | null): Promise<void> {
    if (lastBlock == null) return;

    const asset = OnchainAssets[this.assetKey];
    const lastItem = items.length > 0 ? items[items.length - 1] : null;

    await this.dataSource.transaction(async (manager) => {
      await this.assetTransferRepo.insertMany(items, manager);
      await this.syncStateRepo.upsert(
        {
          chain: asset.chain,
          assetIdentifier: asset.assetIdentifier,
          lastSyncedBlock: normalizeHexBlock(lastBlock),
          lastTransactionHash: lastItem?.transaction_hash ?? null,
          lastLogIndex: lastItem?.log_index ?? null,
          updatedAt: this.clock(),
        },
        manager,
      );
    });
  }
}
