import type {
  RawCardanoAssetTransaction,
  RawCardanoTransactionUtxo,
} from '../../src/adapters/cardano/provider/types.js';
import type { AlchemyAssetTransfer } from '../../src/adapters/evm/provider/types.js';

export const FET_ETHEREUM_IDENTIFIER = '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85';
export const FET_CARDANO_IDENTIFIER = 'e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9464554';

export function createMockAlchemyAssetTransfer(overrides?: Partial<AlchemyAssetTransfer>): AlchemyAssetTransfer {
  return {
    blockNum: '0x6E4D3C',
    uniqueId: '0xabc123def456789000000000000000000000000000000000000000000000abcd:log:0x0',
    hash: '0xabc123def456789000000000000000000000000000000000000000000000abcd',
    from: '0x1234567890ABCDEF1234567890abcdef12345678',
    to: '0xABCDEF1234567890abcdef1234567890ABCDEF12',
    value: 100,
    asset: 'FET',
    category: 'erc20',
    rawContract: {
      value: '0x56bc75e2d63100000',
      address: FET_ETHEREUM_IDENTIFIER,
      decimal: '0x12',
    },
    metadata: {
      blockTimestamp: '2024-01-15T10:30:00.000Z',
    },
    ...overrides,
  };
}

export function createMockBlockfrostAssetTransaction(
  overrides?: Partial<RawCardanoAssetTransaction>,
): RawCardanoAssetTransaction {
  return {
    tx_hash: '52e748c4dec58b687b90b0b40d383b9fe1f24c1a833b7395cdf07dd67859f46f',
    tx_index: 9,
    block_height: 4547,
    block_time: 1635505987,
    ...overrides,
  };
}

export function createMockBlockfrostTransactionUtxo(
  overrides?: Partial<RawCardanoTransactionUtxo>,
): RawCardanoTransactionUtxo {
  return {
    hash: '52e748c4dec58b687b90b0b40d383b9fe1f24c1a833b7395cdf07dd67859f46f',
    inputs: [
      {
        address:
          'addr1q9ld26v2lv8wvrxxmvg90pn8n8n5k6tdst06q2s856rwmvnueldzuuqmnsye359fqrk8hwvenjnqultn7djtrlft7jnq7dy7wv',
        amount: [
          {
            unit: 'lovelace',
            quantity: '42000000',
          },
          {
            unit: FET_CARDANO_IDENTIFIER,
            quantity: '12',
          },
        ],
        tx_hash: '1a0570af966fb355a7160e4f82d5a80b8681b7955f5d44bec0dce628516157f0',
        output_index: 0,
        data_hash: null,
        inline_datum: null,
        reference_script_hash: null,
        collateral: false,
      },
    ],
    outputs: [
      {
        address:
          'addr1qyhr4exrgavdcn3qhfcc9f939fzsch2re5ry9cwvcdyh4x4re5df3pzwwmyq946axfcejy5n4x0y99wqpgtp2gd0k09qdpvhza',
        amount: [
          {
            unit: 'lovelace',
            quantity: '21000000',
          },
          {
            unit: FET_CARDANO_IDENTIFIER,
            quantity: '12',
          },
        ],
        output_index: 0,
        data_hash: null,
        inline_datum: null,
        collateral: false,
        reference_script_hash: null,
      },
    ],
    ...overrides,
  };
}
