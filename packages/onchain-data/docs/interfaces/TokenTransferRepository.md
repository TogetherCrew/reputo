[**@reputo/onchain-data v0.0.0**](../README.md)

***

[@reputo/onchain-data](../globals.md) / TokenTransferRepository

# Interface: TokenTransferRepository

Defined in: [db/repos/token-transfer-repo.ts:14](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/onchain-data/src/db/repos/token-transfer-repo.ts#L14)

## Methods

### insertMany()

> **insertMany**(`items`): `number`

Defined in: [db/repos/token-transfer-repo.ts:15](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/onchain-data/src/db/repos/token-transfer-repo.ts#L15)

#### Parameters

##### items

[`TokenTransferRecord`](../type-aliases/TokenTransferRecord.md)[]

#### Returns

`number`

***

### findByAddress()

> **findByAddress**(`input`): [`TokenTransferRecord`](../type-aliases/TokenTransferRecord.md)[]

Defined in: [db/repos/token-transfer-repo.ts:16](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/onchain-data/src/db/repos/token-transfer-repo.ts#L16)

#### Parameters

##### input

###### tokenChain

[`FET_ETHEREUM`](../enumerations/SupportedTokenChain.md#fet_ethereum)

###### address

`string`

###### fromBlock?

`string`

###### toBlock?

`string`

###### direction?

[`TransferDirection`](../enumerations/TransferDirection.md)

#### Returns

[`TokenTransferRecord`](../type-aliases/TokenTransferRecord.md)[]
