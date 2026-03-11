import type BetterSqlite3 from 'better-sqlite3';
import { normalizeHexBlock, type SupportedTokenChain, type TokenTransferSyncState } from '../../shared/index.js';
import type { TokenTransferSyncStateRow } from '../schema.js';

export interface TokenTransferSyncStateRepository {
  findByTokenChain(tokenChain: SupportedTokenChain): TokenTransferSyncState | null;
  upsert(input: TokenTransferSyncState): void;
}

export function createTokenTransferSyncStateRepository(
  sqlite: BetterSqlite3.Database,
): TokenTransferSyncStateRepository {
  const findStmt = sqlite.prepare('SELECT * FROM token_transfer_sync_state WHERE token_chain = ?');

  const upsertStmt = sqlite.prepare(`
    INSERT INTO token_transfer_sync_state (token_chain, last_synced_block, updated_at)
    VALUES (@tokenChain, @lastSyncedBlock, @updatedAt)
    ON CONFLICT (token_chain) DO UPDATE SET
      last_synced_block = @lastSyncedBlock,
      updated_at = @updatedAt
  `);

  return {
    findByTokenChain(tokenChain: SupportedTokenChain): TokenTransferSyncState | null {
      const row = findStmt.get(tokenChain) as TokenTransferSyncStateRow | undefined;
      if (!row) return null;
      return {
        tokenChain: row.token_chain as SupportedTokenChain,
        lastSyncedBlock: normalizeHexBlock(row.last_synced_block),
        updatedAt: row.updated_at,
      };
    },

    upsert(input: TokenTransferSyncState): void {
      upsertStmt.run({
        tokenChain: input.tokenChain,
        lastSyncedBlock: normalizeHexBlock(input.lastSyncedBlock),
        updatedAt: input.updatedAt,
      });
    },
  };
}
