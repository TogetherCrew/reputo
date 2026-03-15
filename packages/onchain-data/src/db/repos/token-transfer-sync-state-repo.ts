import type { DataSource, Repository } from 'typeorm';
import { normalizeHexBlock, type SupportedTokenChain, type TokenTransferSyncState } from '../../shared/index.js';
import { type TokenTransferSyncStateEntity, TokenTransferSyncStateSchema } from '../schema.js';

export interface TokenTransferSyncStateRepository {
  findByTokenChain(tokenChain: SupportedTokenChain): Promise<TokenTransferSyncState | null>;
  upsert(input: TokenTransferSyncState): Promise<void>;
}

export function createTokenTransferSyncStateRepository(dataSource: DataSource): TokenTransferSyncStateRepository {
  const repo: Repository<TokenTransferSyncStateEntity> = dataSource.getRepository(TokenTransferSyncStateSchema);

  return {
    async findByTokenChain(tokenChain: SupportedTokenChain): Promise<TokenTransferSyncState | null> {
      const row = await repo.findOneBy({ token_chain: tokenChain });
      if (!row) return null;
      return {
        tokenChain: row.token_chain as SupportedTokenChain,
        lastSyncedBlock: normalizeHexBlock(row.last_synced_block),
        ...(row.last_transaction_hash != null && { lastTransactionHash: row.last_transaction_hash }),
        ...(row.last_log_index != null && { lastLogIndex: row.last_log_index }),
        updatedAt: row.updated_at,
      };
    },

    async upsert(input: TokenTransferSyncState): Promise<void> {
      await repo
        .createQueryBuilder()
        .insert()
        .into(TokenTransferSyncStateSchema)
        .values({
          token_chain: input.tokenChain,
          last_synced_block: normalizeHexBlock(input.lastSyncedBlock),
          last_transaction_hash: input.lastTransactionHash ?? null,
          last_log_index: input.lastLogIndex ?? null,
          updated_at: input.updatedAt,
        })
        .orUpdate(['last_synced_block', 'last_transaction_hash', 'last_log_index', 'updated_at'], ['token_chain'])
        .execute();
    },
  };
}
