[**@reputo/onchain-data v0.0.0**](../README.md)

***

[@reputo/onchain-data](../globals.md) / normalizeAlchemyEthereumTransfer

# Function: normalizeAlchemyEthereumTransfer()

> **normalizeAlchemyEthereumTransfer**(`input`): [`AssetTransferEntity`](../interfaces/AssetTransferEntity.md)

Defined in: [providers/ethereum/normalize-alchemy-transfer.ts:16](https://github.com/reputo-org/reputo/blob/962d0d201e0df08eadcc1d7d37a05f21cfe65d22/packages/onchain-data/src/providers/ethereum/normalize-alchemy-transfer.ts#L16)

Normalizes a single Alchemy transfer to the shape of AssetTransferSchema (AssetTransferEntity).
Block and timestamp are numbers (block number as integer, block_timestamp_unix as Unix seconds).

## Parameters

### input

#### assetKey

`"fet_ethereum"` \| `"fet_cardano"` \| `"fet_cosmos"`

#### transfer

`AlchemyAssetTransfer`

## Returns

[`AssetTransferEntity`](../interfaces/AssetTransferEntity.md)
