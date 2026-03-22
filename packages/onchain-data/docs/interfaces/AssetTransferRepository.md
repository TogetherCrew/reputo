[**@reputo/onchain-data v0.0.0**](../README.md)

***

[@reputo/onchain-data](../globals.md) / AssetTransferRepository

# Interface: AssetTransferRepository

Defined in: [db/repos/asset-transfer-repo.ts:19](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/onchain-data/src/db/repos/asset-transfer-repo.ts#L19)

## Methods

### insertMany()

> **insertMany**(`items`, `manager?`): `Promise`\<`void`\>

Defined in: [db/repos/asset-transfer-repo.ts:20](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/onchain-data/src/db/repos/asset-transfer-repo.ts#L20)

#### Parameters

##### items

[`AssetTransferEntity`](AssetTransferEntity.md)[]

##### manager?

`EntityManager`

#### Returns

`Promise`\<`void`\>

***

### findTransfersByAddresses()

> **findTransfersByAddresses**(`input`): `Promise`\<[`AssetTransferEntity`](AssetTransferEntity.md)[]\>

Defined in: [db/repos/asset-transfer-repo.ts:21](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/onchain-data/src/db/repos/asset-transfer-repo.ts#L21)

#### Parameters

##### input

[`GetTransfersInput`](../type-aliases/GetTransfersInput.md)

#### Returns

`Promise`\<[`AssetTransferEntity`](AssetTransferEntity.md)[]\>
