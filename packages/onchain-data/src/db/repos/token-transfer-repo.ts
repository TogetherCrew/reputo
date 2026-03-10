import type BetterSqlite3 from 'better-sqlite3';
import {
  normalizeEvmAddress,
  type SupportedTokenChain,
  type TokenTransferRecord,
  TransferDirection,
} from '../../shared/index.js';
import type { TokenTransferRow } from '../schema.js';

export interface TokenTransferRepository {
  insertMany(items: TokenTransferRecord[]): number;
  findByAddress(input: {
    tokenChain: SupportedTokenChain;
    address: string;
    fromBlock?: number;
    toBlock?: number;
    direction?: TransferDirection;
  }): TokenTransferRecord[];
}

export function createTokenTransferRepository(sqlite: BetterSqlite3.Database): TokenTransferRepository {
  const insertStmt = sqlite.prepare(`
    INSERT OR IGNORE INTO token_transfers
      (id, token_chain, contract_address, block_number, transaction_hash, log_index,
       from_address, to_address, amount, block_timestamp, raw_json, created_at)
    VALUES
      (@id, @tokenChain, @contractAddress, @blockNumber, @transactionHash, @logIndex,
       @fromAddress, @toAddress, @amount, @blockTimestamp, @rawJson, @createdAt)
  `);

  return {
    insertMany(items: TokenTransferRecord[]): number {
      let inserted = 0;
      for (const item of items) {
        const result = insertStmt.run({
          id: item.id,
          tokenChain: item.tokenChain,
          contractAddress: item.contractAddress,
          blockNumber: item.blockNumber,
          transactionHash: item.transactionHash,
          logIndex: item.logIndex,
          fromAddress: item.fromAddress,
          toAddress: item.toAddress,
          amount: item.amount,
          blockTimestamp: item.blockTimestamp,
          rawJson: item.rawJson,
          createdAt: item.createdAt,
        });
        inserted += result.changes;
      }
      return inserted;
    },

    findByAddress(input): TokenTransferRecord[] {
      const conditions: string[] = ['token_chain = @tokenChain'];
      const params: Record<string, unknown> = { tokenChain: input.tokenChain };

      const normalizedAddress = normalizeEvmAddress(input.address);
      params.address = normalizedAddress;

      const direction = input.direction ?? TransferDirection.BOTH;
      if (direction === TransferDirection.INBOUND) {
        conditions.push('to_address = @address');
      } else if (direction === TransferDirection.OUTBOUND) {
        conditions.push('from_address = @address');
      } else {
        conditions.push('(from_address = @address OR to_address = @address)');
      }

      if (input.fromBlock !== undefined) {
        conditions.push('block_number >= @fromBlock');
        params.fromBlock = input.fromBlock;
      }
      if (input.toBlock !== undefined) {
        conditions.push('block_number <= @toBlock');
        params.toBlock = input.toBlock;
      }

      const sql = `SELECT * FROM token_transfers WHERE ${conditions.join(' AND ')} ORDER BY block_number ASC, log_index ASC`;
      const rows = sqlite.prepare(sql).all(params) as TokenTransferRow[];
      return rows.map(rowToRecord);
    },
  };
}

function rowToRecord(row: TokenTransferRow): TokenTransferRecord {
  return {
    id: row.id,
    tokenChain: row.token_chain as SupportedTokenChain,
    contractAddress: row.contract_address,
    blockNumber: row.block_number,
    transactionHash: row.transaction_hash,
    logIndex: row.log_index,
    fromAddress: row.from_address,
    toAddress: row.to_address,
    amount: row.amount,
    blockTimestamp: row.block_timestamp,
    rawJson: row.raw_json,
    createdAt: row.created_at,
  };
}
