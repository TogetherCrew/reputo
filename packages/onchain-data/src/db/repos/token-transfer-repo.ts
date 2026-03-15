import { Brackets, type DataSource, type Repository } from 'typeorm';
import {
  createHexBlockSortKey,
  normalizeEvmAddress,
  normalizeHexBlock,
  type SupportedTokenChain,
  type TokenTransferRecord,
  TransferDirection,
} from '../../shared/index.js';
import { type TokenTransferEntity, TokenTransferSchema } from '../schema.js';

const BLOCK_SORT_SQL = `substr('${'0'.repeat(64)}' || substr(lower(t.block_number), 3), -64, 64)`;

export type FindTransfersInput = {
  tokenChain: SupportedTokenChain;
  addresses: string[];
  limit: number;
  cursor?: { blockNumber: string; logIndex: number };
};

export type PaginatedTransfers = {
  items: TokenTransferRecord[];
  nextCursor: { blockNumber: string; logIndex: number } | null;
};

export interface TokenTransferRepository {
  insertMany(items: TokenTransferRecord[]): Promise<number>;

  findByAddress(input: {
    tokenChain: SupportedTokenChain;
    address: string;
    fromBlock?: string;
    toBlock?: string;
    direction?: TransferDirection;
  }): Promise<TokenTransferRecord[]>;

  findTransfersByAddresses(input: FindTransfersInput): Promise<PaginatedTransfers>;
}

export function createTokenTransferRepository(dataSource: DataSource): TokenTransferRepository {
  const repo: Repository<TokenTransferEntity> = dataSource.getRepository(TokenTransferSchema);

  const insertSql =
    'INSERT INTO token_transfers (token_chain, block_number, transaction_hash, log_index, from_address, to_address, amount, block_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (token_chain, transaction_hash, log_index) DO NOTHING';

  return {
    async insertMany(items: TokenTransferRecord[]): Promise<number> {
      if (items.length === 0) return 0;

      const qr = dataSource.createQueryRunner();
      let totalInserted = 0;

      try {
        for (const item of items) {
          await qr.query(insertSql, [
            item.tokenChain,
            normalizeHexBlock(item.blockNumber),
            item.transactionHash,
            item.logIndex,
            item.fromAddress,
            item.toAddress,
            item.amount,
            item.blockTimestamp,
          ]);
          const [{ cnt }] = (await qr.query('SELECT changes() as cnt')) as [{ cnt: number }];
          totalInserted += cnt;
        }
      } finally {
        await qr.release();
      }

      return totalInserted;
    },

    async findByAddress(input): Promise<TokenTransferRecord[]> {
      const normalizedAddress = normalizeEvmAddress(input.address);
      const direction = input.direction ?? TransferDirection.BOTH;

      const qb = repo.createQueryBuilder('t').where('t.token_chain = :tokenChain', { tokenChain: input.tokenChain });

      if (direction === TransferDirection.INBOUND) {
        qb.andWhere('t.to_address = :address', { address: normalizedAddress });
      } else if (direction === TransferDirection.OUTBOUND) {
        qb.andWhere('t.from_address = :address', { address: normalizedAddress });
      } else {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where('t.from_address = :address', { address: normalizedAddress })
              .orWhere('t.to_address = :address', { address: normalizedAddress });
          }),
        );
      }

      if (input.fromBlock !== undefined) {
        qb.andWhere(`${BLOCK_SORT_SQL} >= :fromBlockKey`, {
          fromBlockKey: createHexBlockSortKey(input.fromBlock),
        });
      }
      if (input.toBlock !== undefined) {
        qb.andWhere(`${BLOCK_SORT_SQL} <= :toBlockKey`, {
          toBlockKey: createHexBlockSortKey(input.toBlock),
        });
      }

      qb.orderBy(BLOCK_SORT_SQL, 'ASC').addOrderBy('t.log_index', 'ASC');

      const rows = await qb.getMany();
      return rows.map(entityToRecord);
    },

    async findTransfersByAddresses(input): Promise<PaginatedTransfers> {
      if (input.addresses.length === 0) {
        return { items: [], nextCursor: null };
      }

      const normalized = input.addresses.map(normalizeEvmAddress);

      const qb = repo
        .createQueryBuilder('t')
        .where('t.token_chain = :tokenChain', { tokenChain: input.tokenChain })
        .andWhere(
          new Brackets((sub) => {
            sub
              .where('t.from_address IN (:...addresses)', { addresses: normalized })
              .orWhere('t.to_address IN (:...addresses)', { addresses: normalized });
          }),
        );

      if (input.cursor) {
        const cursorSortKey = createHexBlockSortKey(input.cursor.blockNumber);
        qb.andWhere(
          new Brackets((sub) => {
            sub.where(`${BLOCK_SORT_SQL} > :cursorSortKey`, { cursorSortKey }).orWhere(
              new Brackets((inner) => {
                inner
                  .where(`${BLOCK_SORT_SQL} = :cursorSortKey`, { cursorSortKey })
                  .andWhere('t.log_index > :cursorLogIndex', { cursorLogIndex: input.cursor!.logIndex });
              }),
            );
          }),
        );
      }

      qb.orderBy(BLOCK_SORT_SQL, 'ASC')
        .addOrderBy('t.log_index', 'ASC')
        .limit(input.limit + 1);

      const rows = await qb.getMany();
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;

      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const nextCursor =
        hasMore && lastItem
          ? { blockNumber: normalizeHexBlock(lastItem.block_number), logIndex: lastItem.log_index }
          : null;

      return {
        items: items.map(entityToRecord),
        nextCursor,
      };
    },
  };
}

function entityToRecord(entity: TokenTransferEntity): TokenTransferRecord {
  return {
    id: `${entity.token_chain}:${entity.transaction_hash}:${entity.log_index}`,
    tokenChain: entity.token_chain as SupportedTokenChain,
    blockNumber: normalizeHexBlock(entity.block_number),
    transactionHash: entity.transaction_hash,
    logIndex: entity.log_index,
    fromAddress: entity.from_address,
    toAddress: entity.to_address,
    amount: entity.amount,
    blockTimestamp: entity.block_timestamp,
  };
}
