export type { TokenTransferRepository } from './db/repos/token-transfer-repo.js';

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
  type TokenChainMetadata,
  type TokenTransferRecord,
  type TokenTransferSyncState,
  TransferDirection,
} from './shared/index.js';

import type { TokenTransferRepository } from './db/repos/token-transfer-repo.js';
import { createTokenTransferRepository as _createInternalRepo } from './db/repos/token-transfer-repo.js';
import { createDatabase } from './db/sqlite.js';

export type TokenTransferReadRepository = TokenTransferRepository & {
  close(): void;
};

export function createTokenTransferRepository(input: { dbPath: string }): TokenTransferReadRepository {
  const db = createDatabase(input.dbPath);
  const repo = _createInternalRepo(db.sqlite);
  return {
    insertMany: repo.insertMany,
    findByAddress: repo.findByAddress,
    close: () => db.close(),
  };
}
