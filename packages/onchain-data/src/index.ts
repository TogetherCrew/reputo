export type {
  ChainPositionCursor,
  FindTransfersInput,
  OrderedTokenTransferRecord,
  PaginatedTransfers,
  TokenTransferRepository,
} from './db/repos/token-transfer-repo.js';

export {
  type CreateSyncTokenTransfersServiceInput,
  createSyncTokenTransfersService,
  normalizeAlchemyEthereumTransfer,
  type SyncTokenTransfersResult,
  type SyncTokenTransfersService,
} from './services/sync-token-transfers-service.js';
export {
  SupportedChain,
  SupportedProvider,
  SupportedToken,
  SupportedTokenChain,
  TOKEN_CHAIN_METADATA,
  type TokenChainMetadata,
  type TokenTransferRecord,
  type TokenTransferSyncState,
  TransferDirection,
} from './shared/index.js';

import type { TokenTransferRepository } from './db/repos/token-transfer-repo.js';
import { createTokenTransferRepository as _createInternalRepo } from './db/repos/token-transfer-repo.js';
import { createDataSource } from './db/sqlite.js';

export type TokenTransferReadRepository = TokenTransferRepository & {
  close(): Promise<void>;
};

export async function createTokenTransferRepository(input: { dbPath: string }): Promise<TokenTransferReadRepository> {
  const dataSource = await createDataSource(input.dbPath);
  const repo = _createInternalRepo(dataSource);
  return {
    insertMany: repo.insertMany,
    findByAddress: repo.findByAddress,
    findTransfersByAddresses: repo.findTransfersByAddresses,
    close: () => dataSource.destroy(),
  };
}
