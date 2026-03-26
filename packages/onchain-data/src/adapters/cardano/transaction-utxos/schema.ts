import { EntitySchema } from 'typeorm';

import type { RawCardanoTransactionUtxo } from '../provider/types.js';

export const CARDANO_TRANSACTION_UTXOS_TABLE = 'cardano_transaction_utxos';
export const CARDANO_TRANSACTION_UTXO_INPUTS_TABLE = 'cardano_transaction_utxo_inputs';
export const CARDANO_TRANSACTION_UTXO_INPUT_AMOUNTS_TABLE = 'cardano_transaction_utxo_input_amounts';
export const CARDANO_TRANSACTION_UTXO_OUTPUTS_TABLE = 'cardano_transaction_utxo_outputs';
export const CARDANO_TRANSACTION_UTXO_OUTPUT_AMOUNTS_TABLE = 'cardano_transaction_utxo_output_amounts';

export interface CardanoTransactionUtxoRow {
  chain: string;
  tx_hash: string;
  raw_json: RawCardanoTransactionUtxo;
}

export interface CardanoTransactionUtxoInputRow {
  chain: string;
  tx_hash: string;
  input_index: number;
  address: string;
  source_tx_hash: string;
  source_output_index: number;
  data_hash: string | null;
  inline_datum: string | null;
  reference_script_hash: string | null;
  collateral: boolean;
  reference: boolean | null;
}

export interface CardanoTransactionUtxoInputAmountRow {
  chain: string;
  tx_hash: string;
  input_index: number;
  amount_index: number;
  unit: string;
  quantity: string;
}

export interface CardanoTransactionUtxoOutputRow {
  chain: string;
  tx_hash: string;
  output_index: number;
  address: string;
  data_hash: string | null;
  inline_datum: string | null;
  collateral: boolean;
  reference_script_hash: string | null;
  consumed_by_tx_hash: string | null;
}

export interface CardanoTransactionUtxoOutputAmountRow {
  chain: string;
  tx_hash: string;
  output_index: number;
  amount_index: number;
  unit: string;
  quantity: string;
}

export interface CardanoTransactionUtxoWriteSet {
  transaction: CardanoTransactionUtxoRow;
  inputs: CardanoTransactionUtxoInputRow[];
  inputAmounts: CardanoTransactionUtxoInputAmountRow[];
  outputs: CardanoTransactionUtxoOutputRow[];
  outputAmounts: CardanoTransactionUtxoOutputAmountRow[];
}

export const CardanoTransactionUtxoEntitySchema = new EntitySchema<CardanoTransactionUtxoRow>({
  name: 'cardano_transaction_utxo',
  tableName: CARDANO_TRANSACTION_UTXOS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    raw_json: {
      type: 'jsonb',
    },
  },
});

export const CardanoTransactionUtxoInputEntitySchema = new EntitySchema<CardanoTransactionUtxoInputRow>({
  name: 'cardano_transaction_utxo_input',
  tableName: CARDANO_TRANSACTION_UTXO_INPUTS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    input_index: {
      type: 'integer',
      primary: true,
    },
    address: {
      type: 'text',
    },
    source_tx_hash: {
      type: 'text',
    },
    source_output_index: {
      type: 'integer',
    },
    data_hash: {
      type: 'text',
      nullable: true,
    },
    inline_datum: {
      type: 'text',
      nullable: true,
    },
    reference_script_hash: {
      type: 'text',
      nullable: true,
    },
    collateral: {
      type: 'boolean',
    },
    reference: {
      type: 'boolean',
      nullable: true,
    },
  },
  foreignKeys: [
    {
      name: 'fk_cardano_tx_utxo_inputs_tx',
      target: CardanoTransactionUtxoEntitySchema,
      columnNames: ['chain', 'tx_hash'],
      referencedColumnNames: ['chain', 'tx_hash'],
      onDelete: 'CASCADE',
    },
  ],
});

export const CardanoTransactionUtxoInputAmountEntitySchema = new EntitySchema<CardanoTransactionUtxoInputAmountRow>({
  name: 'cardano_transaction_utxo_input_amount',
  tableName: CARDANO_TRANSACTION_UTXO_INPUT_AMOUNTS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    input_index: {
      type: 'integer',
      primary: true,
    },
    amount_index: {
      type: 'integer',
      primary: true,
    },
    unit: {
      type: 'text',
    },
    quantity: {
      type: 'numeric',
    },
  },
  foreignKeys: [
    {
      name: 'fk_cardano_tx_utxo_input_amounts_input',
      target: CardanoTransactionUtxoInputEntitySchema,
      columnNames: ['chain', 'tx_hash', 'input_index'],
      referencedColumnNames: ['chain', 'tx_hash', 'input_index'],
      onDelete: 'CASCADE',
    },
  ],
});

export const CardanoTransactionUtxoOutputEntitySchema = new EntitySchema<CardanoTransactionUtxoOutputRow>({
  name: 'cardano_transaction_utxo_output',
  tableName: CARDANO_TRANSACTION_UTXO_OUTPUTS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    output_index: {
      type: 'integer',
      primary: true,
    },
    address: {
      type: 'text',
    },
    data_hash: {
      type: 'text',
      nullable: true,
    },
    inline_datum: {
      type: 'text',
      nullable: true,
    },
    collateral: {
      type: 'boolean',
    },
    reference_script_hash: {
      type: 'text',
      nullable: true,
    },
    consumed_by_tx_hash: {
      type: 'text',
      nullable: true,
    },
  },
  foreignKeys: [
    {
      name: 'fk_cardano_tx_utxo_outputs_tx',
      target: CardanoTransactionUtxoEntitySchema,
      columnNames: ['chain', 'tx_hash'],
      referencedColumnNames: ['chain', 'tx_hash'],
      onDelete: 'CASCADE',
    },
  ],
});

export const CardanoTransactionUtxoOutputAmountEntitySchema = new EntitySchema<CardanoTransactionUtxoOutputAmountRow>({
  name: 'cardano_transaction_utxo_output_amount',
  tableName: CARDANO_TRANSACTION_UTXO_OUTPUT_AMOUNTS_TABLE,
  columns: {
    chain: {
      type: 'text',
      primary: true,
    },
    tx_hash: {
      type: 'text',
      primary: true,
    },
    output_index: {
      type: 'integer',
      primary: true,
    },
    amount_index: {
      type: 'integer',
      primary: true,
    },
    unit: {
      type: 'text',
    },
    quantity: {
      type: 'numeric',
    },
  },
  foreignKeys: [
    {
      name: 'fk_cardano_tx_utxo_output_amounts_output',
      target: CardanoTransactionUtxoOutputEntitySchema,
      columnNames: ['chain', 'tx_hash', 'output_index'],
      referencedColumnNames: ['chain', 'tx_hash', 'output_index'],
      onDelete: 'CASCADE',
    },
  ],
});

export function toCardanoTransactionUtxoWriteSet(input: {
  chain: string;
  txHash: string;
  transactionUtxo: RawCardanoTransactionUtxo;
}): CardanoTransactionUtxoWriteSet {
  if (input.txHash !== input.transactionUtxo.hash) {
    throw new Error(
      `Cardano transaction UTXO hash mismatch: expected "${input.txHash}", received "${input.transactionUtxo.hash}"`,
    );
  }

  const transaction: CardanoTransactionUtxoRow = {
    chain: input.chain,
    tx_hash: input.txHash,
    raw_json: input.transactionUtxo,
  };

  const inputs = input.transactionUtxo.inputs.map<CardanoTransactionUtxoInputRow>((transactionInput, inputIndex) => ({
    chain: input.chain,
    tx_hash: input.txHash,
    input_index: inputIndex,
    address: transactionInput.address,
    source_tx_hash: transactionInput.tx_hash,
    source_output_index: transactionInput.output_index,
    data_hash: transactionInput.data_hash,
    inline_datum: transactionInput.inline_datum,
    reference_script_hash: transactionInput.reference_script_hash,
    collateral: transactionInput.collateral,
    reference: transactionInput.reference ?? null,
  }));

  const inputAmounts = input.transactionUtxo.inputs.flatMap((transactionInput, inputIndex) =>
    transactionInput.amount.map<CardanoTransactionUtxoInputAmountRow>((amount, amountIndex) => ({
      chain: input.chain,
      tx_hash: input.txHash,
      input_index: inputIndex,
      amount_index: amountIndex,
      unit: amount.unit,
      quantity: amount.quantity,
    })),
  );

  const outputs = input.transactionUtxo.outputs.map<CardanoTransactionUtxoOutputRow>((transactionOutput) => ({
    chain: input.chain,
    tx_hash: input.txHash,
    output_index: transactionOutput.output_index,
    address: transactionOutput.address,
    data_hash: transactionOutput.data_hash,
    inline_datum: transactionOutput.inline_datum,
    collateral: transactionOutput.collateral,
    reference_script_hash: transactionOutput.reference_script_hash,
    consumed_by_tx_hash: transactionOutput.consumed_by_tx ?? null,
  }));

  const outputAmounts = input.transactionUtxo.outputs.flatMap((transactionOutput) =>
    transactionOutput.amount.map<CardanoTransactionUtxoOutputAmountRow>((amount, amountIndex) => ({
      chain: input.chain,
      tx_hash: input.txHash,
      output_index: transactionOutput.output_index,
      amount_index: amountIndex,
      unit: amount.unit,
      quantity: amount.quantity,
    })),
  );

  return {
    transaction,
    inputs,
    inputAmounts,
    outputs,
    outputAmounts,
  };
}
