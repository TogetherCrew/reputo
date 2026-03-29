import { createDb } from '../db/client.js';
import {
  type CardanoTransferReadRepository,
  createCardanoTransferReadRepository,
} from './cardano/transfers/read-repository.js';
import { createEvmTransferReadRepository, type EvmTransferReadRepository } from './evm/transfers/read-repository.js';

export interface OnchainReadRepositories {
  evm: EvmTransferReadRepository;
  cardano: CardanoTransferReadRepository;
  close(): Promise<void>;
}

export async function createOnchainReadRepositories(input: { databaseUrl: string }): Promise<OnchainReadRepositories> {
  const db = await createDb({ databaseUrl: input.databaseUrl });

  return {
    evm: createEvmTransferReadRepository(db),
    cardano: createCardanoTransferReadRepository(db),
    async close() {
      if (db.isInitialized) {
        await db.destroy();
      }
    },
  };
}
