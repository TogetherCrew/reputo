import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';
import { createTokenTransferRepository } from '../../../src/db/repos/token-transfer-repo.js';
import { createTokenTransferSyncStateRepository } from '../../../src/db/repos/token-transfer-sync-state-repo.js';
import { createDatabase } from '../../../src/db/sqlite.js';
import { SupportedTokenChain } from '../../../src/shared/index.js';

describe('createDatabase', () => {
  const cleanupPaths: string[] = [];

  afterEach(() => {
    for (const targetPath of cleanupPaths.splice(0)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  });

  it('migrates legacy integer block columns to hex string storage', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'onchain-data-'));
    cleanupPaths.push(tempDir);

    const dbPath = path.join(tempDir, 'legacy.db');
    const legacyDb = new BetterSqlite3(dbPath);

    legacyDb.exec(`
CREATE TABLE token_transfers (
  id TEXT PRIMARY KEY,
  token_chain TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount TEXT NOT NULL,
  block_timestamp TEXT,
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX token_transfers_unique_event_idx
  ON token_transfers(token_chain, transaction_hash, log_index);

CREATE TABLE token_transfer_sync_state (
  token_chain TEXT PRIMARY KEY,
  last_synced_block INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
    `);

    legacyDb
      .prepare(`
        INSERT INTO token_transfers (
          id, token_chain, contract_address, block_number, transaction_hash, log_index,
          from_address, to_address, amount, block_timestamp, raw_json, created_at
        ) VALUES (
          @id, @tokenChain, @contractAddress, @blockNumber, @transactionHash, @logIndex,
          @fromAddress, @toAddress, @amount, @blockTimestamp, @rawJson, @createdAt
        )
      `)
      .run({
        id: 'fet-ethereum:0xlegacy:0',
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        contractAddress: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
        blockNumber: 7261990,
        transactionHash: '0xlegacy',
        logIndex: 0,
        fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
        toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        amount: '100',
        blockTimestamp: '2024-01-15T10:30:00.000Z',
        rawJson: '{}',
        createdAt: '2024-01-15T10:30:00.000Z',
      });

    legacyDb
      .prepare(`
        INSERT INTO token_transfer_sync_state (token_chain, last_synced_block, updated_at)
        VALUES (@tokenChain, @lastSyncedBlock, @updatedAt)
      `)
      .run({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        lastSyncedBlock: 7261989,
        updatedAt: '2024-01-15T10:30:00.000Z',
      });
    legacyDb.close();

    const db = createDatabase(dbPath);
    try {
      const transferRepo = createTokenTransferRepository(db.sqlite);
      const syncStateRepo = createTokenTransferSyncStateRepository(db.sqlite);

      const transfers = transferRepo.findByAddress({
        tokenChain: SupportedTokenChain.FET_ETHEREUM,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        fromBlock: '0x6ecf26',
        toBlock: '0x6ecf26',
      });
      expect(transfers).toHaveLength(1);
      expect(transfers[0].blockNumber).toBe('0x6ecf26');

      const syncState = syncStateRepo.findByTokenChain(SupportedTokenChain.FET_ETHEREUM);
      expect(syncState?.lastSyncedBlock).toBe('0x6ecf25');

      const transferColumns = db.sqlite.prepare(`PRAGMA table_info(token_transfers)`).all() as Array<{
        name: string;
        type: string;
      }>;
      expect(transferColumns.find((column) => column.name === 'block_number')?.type).toBe('TEXT');
      expect(transferColumns.some((c) => c.name === 'id')).toBe(false);
      expect(transferColumns.some((c) => c.name === 'raw_json')).toBe(false);
      expect(transferColumns.some((c) => c.name === 'created_at')).toBe(false);
      expect(transferColumns.some((c) => c.name === 'contract_address')).toBe(false);

      const syncStateColumns = db.sqlite.prepare(`PRAGMA table_info(token_transfer_sync_state)`).all() as Array<{
        name: string;
        type: string;
      }>;
      expect(syncStateColumns.find((column) => column.name === 'last_synced_block')?.type).toBe('TEXT');
    } finally {
      db.close();
    }
  });
});
