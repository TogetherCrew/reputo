export type {
  AssetTransferRepository,
  GetTransfersInput,
} from './db/repos/asset-transfer-repo.js';
export type { AssetTransferEntity } from './db/schema.js';
export {
  normalizeAlchemyEthereumTransfer,
  parseLogIndex,
} from './providers/ethereum/normalize-alchemy-transfer.js';
export {
  type CreateSyncAssetTransfersServiceInput,
  createSyncAssetTransfersService,
  type SyncAssetTransfersResult,
  type SyncAssetTransfersService,
} from './services/sync-asset-transfers-service.js';

export {
  type AssetKey,
  type AssetTransferRecord,
  type AssetTransferSyncState,
  normalizeHexBlock,
  ONCHAIN_ASSET_KEYS,
  ONCHAIN_ASSETS,
  type OnchainAsset,
  OnchainAssets,
} from './shared/index.js';

import type { AssetTransferRepository } from './db/repos/asset-transfer-repo.js';
import { createAssetTransferRepository as _createInternalRepo } from './db/repos/asset-transfer-repo.js';
import { createDataSource } from './db/sqlite.js';

export type AssetTransferReadRepository = AssetTransferRepository & {
  close(): Promise<void>;
};

export async function createAssetTransferRepository(input: { dbPath: string }): Promise<AssetTransferReadRepository> {
  const dataSource = await createDataSource(input.dbPath);
  const repo = _createInternalRepo(dataSource);
  return {
    insertMany: repo.insertMany,
    findTransfersByAddresses: repo.findTransfersByAddresses,
    close: () => dataSource.destroy(),
  };
}
