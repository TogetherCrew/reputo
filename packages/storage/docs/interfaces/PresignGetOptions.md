[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignGetOptions

# Interface: PresignGetOptions

Defined in: [shared/types/types.ts:57](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L57)

Options for generating a presigned GET URL.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:61](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L61)

S3 bucket name where the object is stored.

***

### key

> **key**: `string`

Defined in: [shared/types/types.ts:66](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L66)

S3 key of the object to download.

***

### ttl

> **ttl**: `number`

Defined in: [shared/types/types.ts:71](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/storage/src/shared/types/types.ts#L71)

Time-to-live for the presigned URL in seconds.
