[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ListObjectsByPrefixOptions

# Interface: ListObjectsByPrefixOptions

Defined in: [shared/types/types.ts:290](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L290)

Options for listing objects by prefix.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:294](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L294)

S3 bucket name where the objects are stored.

***

### prefix

> **prefix**: `string`

Defined in: [shared/types/types.ts:299](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L299)

Prefix to filter objects by.

***

### maxKeys?

> `optional` **maxKeys**: `number`

Defined in: [shared/types/types.ts:305](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L305)

Maximum number of keys to return per page.
Default is 1000 (S3 maximum).
