import { Brackets, type DataSource, type EntityManager, type Repository } from 'typeorm';
import { ONCHAIN_ASSET_KEYS } from '../../shared/index.js';
import { type AssetTransferEntity, AssetTransferSchema } from '../schema.js';

const INSERT_CHUNK_SIZE = 2000;

export type GetTransfersInput = {
  assetId: number;
  addresses: string[];
  page: number;
  limit: number;
  orderBy: 'time_asc' | 'time_desc';
  fromTimestampUnix?: number;
  toTimestampUnix?: number;
  fromBlock?: number;
  toBlock?: number;
};

export interface AssetTransferRepository {
  insertMany(items: AssetTransferEntity[], manager?: EntityManager): Promise<void>;
  findTransfersByAddresses(input: GetTransfersInput): Promise<AssetTransferEntity[]>;
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

    async findTransfersByAddresses(input: GetTransfersInput): Promise<AssetTransferEntity[]> {
      const assetKey = ONCHAIN_ASSET_KEYS[input.assetId];
      if (input.addresses.length === 0) {
        return [];
      }

      const offset = (input.page - 1) * input.limit;

      const qb = repo
        .createQueryBuilder('t')
        .where('t.asset_key = :assetKey', { assetKey })
        .andWhere(
          new Brackets((subQb) => {
            subQb
              .where('t.from_address IN (:...addresses)', {
                addresses: input.addresses,
              })
              .orWhere('t.to_address IN (:...addresses)', {
                addresses: input.addresses,
              });
          }),
        );

      if (input.fromBlock !== undefined) {
        qb.andWhere('t.block_number >= :fromBlockNum', {
          fromBlockNum: input.fromBlock,
        });
      }
      if (input.toBlock !== undefined) {
        qb.andWhere('t.block_number <= :toBlockNum', {
          toBlockNum: input.toBlock,
        });
      }
      if (input.fromTimestampUnix !== undefined) {
        qb.andWhere('t.block_timestamp_unix >= :fromTimestampUnix', {
          fromTimestampUnix: input.fromTimestampUnix,
        });
      }
      if (input.toTimestampUnix !== undefined) {
        qb.andWhere('t.block_timestamp_unix <= :toTimestampUnix', {
          toTimestampUnix: input.toTimestampUnix,
        });
      }

      const sortDirection = input.orderBy === 'time_asc' ? 'ASC' : 'DESC';

      return qb
        .orderBy('t.block_number', sortDirection)
        .addOrderBy('t.log_index', sortDirection)
        .addOrderBy('t.transaction_hash', sortDirection)
        .skip(offset)
        .take(input.limit)
        .getMany();
    },
  };
}
