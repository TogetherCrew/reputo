import type BetterSqlite3 from 'better-sqlite3';
import {
  createHexBlockSortKey,
  normalizeEvmAddress,
  normalizeHexBlock,
  type SupportedTokenChain,
  type TokenTransferRecord,
  TransferDirection,
} from '../../shared/index.js';
import type { TokenTransferRow } from '../schema.js';

const BLOCK_SORT_SQL = `substr('${'0'.repeat(64)}' || substr(lower(block_number), 3), -64, 64)`;

export interface TokenTransferRepository {
  insertMany(items: TokenTransferRecord[]): number;
  findByAddress(input: {
    tokenChain: SupportedTokenChain;
    address: string;
    fromBlock?: string;
    toBlock?: string;
    direction?: TransferDirection;
  }): TokenTransferRecord[];
}

export function createTokenTransferRepository(sqlite: BetterSqlite3.Database): TokenTransferRepository {
  const insertStmt = sqlite.prepare(`
    INSERT OR IGNORE INTO token_transfers
      (token_chain, block_number, transaction_hash, log_index,
       from_address, to_address, amount, block_timestamp)
    VALUES
      (@tokenChain, @blockNumber, @transactionHash, @logIndex,
       @fromAddress, @toAddress, @amount, @blockTimestamp)
  `);

  return {
    insertMany(items: TokenTransferRecord[]): number {
      let inserted = 0;
      for (const item of items) {
        const result = insertStmt.run({
          tokenChain: item.tokenChain,
          blockNumber: normalizeHexBlock(item.blockNumber),
          transactionHash: item.transactionHash,
          logIndex: item.logIndex,
          fromAddress: item.fromAddress,
          toAddress: item.toAddress,
          amount: item.amount,
          blockTimestamp: item.blockTimestamp,
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
        conditions.push(`${BLOCK_SORT_SQL} >= @fromBlockSortKey`);
        params.fromBlockSortKey = createHexBlockSortKey(input.fromBlock);
      }
      if (input.toBlock !== undefined) {
        conditions.push(`${BLOCK_SORT_SQL} <= @toBlockSortKey`);
        params.toBlockSortKey = createHexBlockSortKey(input.toBlock);
      }

      const sql = `SELECT * FROM token_transfers WHERE ${conditions.join(' AND ')} ORDER BY ${BLOCK_SORT_SQL} ASC, log_index ASC`;
      const rows = sqlite.prepare(sql).all(params) as TokenTransferRow[];
      return rows.map(rowToRecord);
    },
  };
}

function rowToRecord(row: TokenTransferRow): TokenTransferRecord {
  return {
    id: `${row.token_chain}:${row.transaction_hash}:${row.log_index}`,
    tokenChain: row.token_chain as SupportedTokenChain,
    blockNumber: normalizeHexBlock(row.block_number),
    transactionHash: row.transaction_hash,
    logIndex: row.log_index,
    fromAddress: row.from_address,
    toAddress: row.to_address,
    amount: row.amount,
    blockTimestamp: row.block_timestamp,
  };
}
