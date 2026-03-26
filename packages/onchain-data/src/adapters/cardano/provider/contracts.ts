export type CardanoAssetTransferOrder = 'asc' | 'desc';

export type CardanoAssetTransferWindow = {
  assetIdentifier: string;
  order: CardanoAssetTransferOrder;
};

export type CardanoAssetTransferProviderPage<TTransaction> = {
  items: TTransaction[];
};

export interface CardanoAssetTransferProvider<TTransaction, TUtxo> {
  fetchAssetTransactions(
    input: CardanoAssetTransferWindow,
  ): AsyncGenerator<CardanoAssetTransferProviderPage<TTransaction>>;
  fetchTransactionUtxo(txHash: string): Promise<TUtxo>;
}
