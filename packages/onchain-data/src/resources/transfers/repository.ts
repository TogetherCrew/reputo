import { and, asc, eq, gte, lte, or } from 'drizzle-orm';
import type { OnchainDataDb } from '../../shared/types/db.js';
import { type CreateManyOptions, chunkArray, DEFAULT_CHUNK_SIZE } from '../../shared/utils/index.js';
import { normalizeTransferToRecord } from './normalize.js';
import * as schema from './schema.js';
import type { TransferEvent, TransferQueryOptions } from './types.js';

/**
 * Create a transfers repository bound to the given database instance.
 */
export function createTransfersRepo(db: OnchainDataDb) {
  return {
    create(data: TransferEvent): void {
      db.drizzle.insert(schema.transfers).values(normalizeTransferToRecord(data)).run();
    },

    createMany(items: TransferEvent[], options?: CreateManyOptions): void {
      const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
      const chunks = chunkArray(items, chunkSize);
      db.sqlite.transaction(() => {
        for (const chunk of chunks) {
          db.drizzle.insert(schema.transfers).values(chunk.map(normalizeTransferToRecord)).run();
        }
      })();
    },

    findAll() {
      return db.drizzle.select().from(schema.transfers).all();
    },

    findById(id: number) {
      return db.drizzle.select().from(schema.transfers).where(eq(schema.transfers.id, id)).get();
    },

    /**
     * Query transfers ordered by (block_number, log_index).
     *
     * All filters are optional; at minimum `chainId` is required via
     * {@link TransferQueryOptions}.
     */
    findByQuery(options: TransferQueryOptions) {
      const conditions = [eq(schema.transfers.chainId, options.chainId)];

      if (options.tokenAddress) {
        conditions.push(eq(schema.transfers.tokenAddress, options.tokenAddress));
      }
      if (options.fromBlock !== undefined) {
        conditions.push(gte(schema.transfers.blockNumber, options.fromBlock));
      }
      if (options.toBlock !== undefined) {
        conditions.push(lte(schema.transfers.blockNumber, options.toBlock));
      }

      return db.drizzle
        .select()
        .from(schema.transfers)
        .where(and(...conditions))
        .orderBy(asc(schema.transfers.blockNumber), asc(schema.transfers.logIndex))
        .all();
    },

    /**
     * Query transfers involving a specific address (as sender, receiver, or either).
     */
    findByAddress(chainId: string, address: string, direction: 'from' | 'to' | 'either' = 'either') {
      const chainCondition = eq(schema.transfers.chainId, chainId);

      const addressCondition =
        direction === 'from'
          ? eq(schema.transfers.fromAddress, address)
          : direction === 'to'
            ? eq(schema.transfers.toAddress, address)
            : or(eq(schema.transfers.fromAddress, address), eq(schema.transfers.toAddress, address));

      return db.drizzle
        .select()
        .from(schema.transfers)
        .where(and(chainCondition, addressCondition))
        .orderBy(asc(schema.transfers.blockNumber), asc(schema.transfers.logIndex))
        .all();
    },
  };
}

export type TransfersRepo = ReturnType<typeof createTransfersRepo>;
