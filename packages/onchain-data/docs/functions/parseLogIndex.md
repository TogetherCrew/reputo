[**@reputo/onchain-data v0.0.0**](../README.md)

***

[@reputo/onchain-data](../globals.md) / parseLogIndex

# Function: parseLogIndex()

> **parseLogIndex**(`uniqueId`): `number`

Defined in: [providers/ethereum/normalize-alchemy-transfer.ts:6](https://github.com/reputo-org/reputo/blob/962d0d201e0df08eadcc1d7d37a05f21cfe65d22/packages/onchain-data/src/providers/ethereum/normalize-alchemy-transfer.ts#L6)

Parses log index from Alchemy uniqueId e.g. "0xhash:log:0x0" -> 0, ":log:0xa" -> 10.

## Parameters

### uniqueId

`string`

## Returns

`number`
