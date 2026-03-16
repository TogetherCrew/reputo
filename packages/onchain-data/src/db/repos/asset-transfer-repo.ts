import { Brackets, type DataSource, type EntityManager, type Repository } from 'typeorm';
import { type AssetKey, createHexBlockSortKey, normalizeEvmAddress, normalizeHexBlock } from '../../shared/index.js';
import { type AssetTransferEntity, AssetTransferSchema } from '../schema.js';

const BLOCK_SORT_SQL = `substr('${'0'.repeat(64)}' || lower(hex(t.block_number)), -64, 64)`;
const INSERT_CHUNK_SIZE = 2000;

/** Cursor for paginating transfers by block number and log index. */
export type ChainPositionCursor = { blockNumber: string; logIndex: number };

export type FindTransfersInput = {
  assetKey: AssetKey;
  addresses: string[];
  limit: number;
  cursor?: ChainPositionCursor;
  fromBlock?: string;
  toBlock?: string;
};

export type PaginatedTransfers = {
  items: AssetTransferEntity[];
  nextCursor: ChainPositionCursor | null;
};

export interface AssetTransferRepository {
  insertMany(items: AssetTransferEntity[], manager?: EntityManager): Promise<void>;
  findTransfersByAddresses(input: FindTransfersInput): Promise<PaginatedTransfers>;
}

export function createAssetTransferRepository(dataSource: DataSource): AssetTransferRepository {
  const repo: Repository<AssetTransferEntity> = dataSource.getRepository(AssetTransferSchema);

  return {
    async insertMany(items: AssetTransferEntity[], manager?: EntityManager) {
      if (items.length === 0) return;

      async function executeInsert(txManager: EntityManager): Promise<void> {
        const txRepo = txManager.getRepository(AssetTransferSchema);
        for (let index = 0; index < items.length; index += INSERT_CHUNK_SIZE) {
          await txRepo
            .createQueryBuilder()
            .insert()
            .into(AssetTransferSchema)
            .values(items.slice(index, index + INSERT_CHUNK_SIZE))
            .orIgnore()
            .execute();
        }
      }

      if (manager) {
        await executeInsert(manager);
        return;
      }

      await dataSource.transaction(async (txManager) => {
        await executeInsert(txManager);
      });
    },

    async findTransfersByAddresses(input: FindTransfersInput): Promise<PaginatedTransfers> {
      const normalized = Array.from(new Set(input.addresses.map(normalizeEvmAddress)));
      if (normalized.length === 0) {
        return { items: [], nextCursor: null };
      }

      const qb = repo
        .createQueryBuilder('t')
        .where('t.asset_key = :assetKey', { assetKey: input.assetKey })
        .andWhere('(t.from_address IN (:...addresses) OR t.to_address IN (:...addresses))', { addresses: normalized });

      if (input.fromBlock !== undefined) {
        qb.andWhere('t.block_number >= :fromBlockNum', {
          fromBlockNum: Number(BigInt(normalizeHexBlock(input.fromBlock))),
        });
      }
      if (input.toBlock !== undefined) {
        qb.andWhere('t.block_number <= :toBlockNum', {
          toBlockNum: Number(BigInt(normalizeHexBlock(input.toBlock))),
        });
      }

      if (input.cursor) {
        const { blockNumber, logIndex } = input.cursor;
        const cursorSortKey = createHexBlockSortKey(blockNumber);
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where(`${BLOCK_SORT_SQL} > :cursorSortKeyGt`, {
                cursorSortKeyGt: cursorSortKey,
              })
              .orWhere(
                new Brackets((inner) => {
                  inner
                    .where(`${BLOCK_SORT_SQL} = :cursorSortKeyEq`, {
                      cursorSortKeyEq: cursorSortKey,
                    })
                    .andWhere('t.log_index > :cursorLogIndex', {
                      cursorLogIndex: logIndex,
                    });
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
          ? {
              blockNumber: normalizeHexBlock(lastItem.block_number),
              logIndex: lastItem.log_index,
            }
          : null;

      return {
        items,
        nextCursor,
      };
    },
  };
}
