import { Brackets, type DataSource, type Repository } from 'typeorm';
import {
  type AssetKey,
  type AssetTransferRecord,
  createHexBlockSortKey,
  normalizeEvmAddress,
  normalizeHexBlock,
  OnchainAssets,
} from '../../shared/index.js';
import { type AssetTransferEntity, AssetTransferSchema } from '../schema.js';

const BLOCK_SORT_SQL = `substr('${'0'.repeat(64)}' || substr(lower(t.block_number), 3), -64, 64)`;

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
  items: AssetTransferRecord[];
  nextCursor: ChainPositionCursor | null;
};

export type OrderedAssetTransferRecord = AssetTransferRecord;

export interface AssetTransferRepository {
  insertMany(items: AssetTransferRecord[]): Promise<number>;
  findTransfersByAddresses(input: FindTransfersInput): Promise<PaginatedTransfers>;
}

export function createAssetTransferRepository(dataSource: DataSource): AssetTransferRepository {
  const repo: Repository<AssetTransferEntity> = dataSource.getRepository(AssetTransferSchema);

  const insertSql =
    'INSERT INTO asset_transfers (chain, asset_identifier, block_number, transaction_hash, log_index, from_address, to_address, amount, block_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (chain, asset_identifier, transaction_hash, log_index) DO NOTHING';

  return {
    async insertMany(items: AssetTransferRecord[]): Promise<number> {
      if (items.length === 0) return 0;

      const qr = dataSource.createQueryRunner();
      let totalInserted = 0;

      try {
        for (const item of items) {
          await qr.query(insertSql, [
            item.chain,
            item.assetIdentifier,
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

    async findTransfersByAddresses(input: FindTransfersInput): Promise<PaginatedTransfers> {
      if (input.addresses.length === 0) {
        return { items: [], nextCursor: null };
      }

      const asset = OnchainAssets[input.assetKey];
      const normalized = input.addresses.map(normalizeEvmAddress);

      const qb = repo
        .createQueryBuilder('t')
        .where('t.chain = :chain', { chain: asset.chain })
        .andWhere('t.asset_identifier = :assetIdentifier', { assetIdentifier: asset.assetIdentifier })
        .andWhere('(t.from_address IN (:...addresses) OR t.to_address IN (:...addresses))', { addresses: normalized });

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

      if (input.cursor) {
        const { blockNumber, logIndex } = input.cursor;
        const cursorSortKey = createHexBlockSortKey(blockNumber);
        qb.andWhere(
          new Brackets((sub) => {
            sub.where(`${BLOCK_SORT_SQL} > :cursorSortKey`, { cursorSortKey }).orWhere(
              new Brackets((inner) => {
                inner
                  .where(`${BLOCK_SORT_SQL} = :cursorSortKey`, { cursorSortKey })
                  .andWhere('t.log_index > :cursorLogIndex', { cursorLogIndex: logIndex });
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
        items: items.map((entity) => entityToRecord(entity)),
        nextCursor,
      };
    },
  };
}

function entityToRecord(entity: AssetTransferEntity): AssetTransferRecord {
  return {
    id: `${entity.chain}:${entity.asset_identifier}:${entity.transaction_hash}:${entity.log_index}`,
    chain: entity.chain,
    assetIdentifier: entity.asset_identifier,
    blockNumber: normalizeHexBlock(entity.block_number),
    transactionHash: entity.transaction_hash,
    logIndex: entity.log_index,
    fromAddress: entity.from_address,
    toAddress: entity.to_address,
    amount: entity.amount,
    blockTimestamp: entity.block_timestamp,
  };
}
