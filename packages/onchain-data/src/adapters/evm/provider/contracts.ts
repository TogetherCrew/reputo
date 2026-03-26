export type EvmAssetTransferWindow = {
  chain: string;
  assetIdentifier: string;
  fromBlock: string;
  toBlock: string;
};

export type EvmAssetTransferProviderPage<TTransfer> = {
  items: TTransfer[];
  lastBlock: string;
};

export interface EvmAssetTransferProvider<TTransfer> {
  getFinalizedBlock(chain: string): Promise<string>;
  fetchAssetTransfers(input: EvmAssetTransferWindow): AsyncGenerator<EvmAssetTransferProviderPage<TTransfer>>;
}
