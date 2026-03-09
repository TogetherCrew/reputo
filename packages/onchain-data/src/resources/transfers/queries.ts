import { CHAIN_IDS } from '../../providers/evm/alchemy/config.js';
import type { OnchainDataDb } from '../../shared/types/db.js';
import { canonicalizeEvmAddress } from '../../shared/utils/evm.js';
import { createTransfersRepo } from './repository.js';
import type { DeterministicTransferQueryParams, TransferRecord } from './types.js';

/**
 * Deterministic transfer query surface.
 *
 * Reads only from persisted normalized transfer rows. No provider calls.
 * Ordering: block_number ASC, transaction_hash ASC, log_index ASC
 * (schema has no transaction_index; transaction_hash provides stable order within a block).
 *
 * Point-in-time: toBlock is inclusive (all events where block_number <= toBlock).
 * Bounded range: when fromBlock is set, only rows with block_number in [fromBlock, toBlock].
 */
export function createDeterministicTransferQueries(db: OnchainDataDb) {
  const repo = createTransfersRepo(db);

  return {
    /**
     * List transfers for a token in deterministic order.
     * EVM token address is canonicalized before filtering.
     *
     * @param params.chain - Chain name (e.g. 'ethereum')
     * @param params.tokenContractAddress - Token contract address (canonicalized for EVM)
     * @param params.fromBlock - Optional lower bound (inclusive)
     * @param params.toBlock - Upper bound (inclusive); required
     * @returns Rows ordered by block_number ASC, transaction_hash ASC, log_index ASC
     */
    listTransfers(params: DeterministicTransferQueryParams): TransferRecord[] {
      const chainId = CHAIN_IDS[params.chain];
      if (!chainId) {
        throw new Error(`Unknown chain: "${params.chain}". No chain ID mapping found.`);
      }

      const tokenAddress = canonicalizeEvmAddress(params.tokenContractAddress);

      return repo.findByQuery({
        chainId,
        tokenAddress,
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
      });
    },
  };
}

export type DeterministicTransferQueries = ReturnType<typeof createDeterministicTransferQueries>;
