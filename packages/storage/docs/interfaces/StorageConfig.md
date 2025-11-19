[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageConfig

# Interface: StorageConfig

Defined in: [shared/types/types.ts:10](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L10)

Configuration options for the Storage instance.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:14](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L14)

S3 bucket name where objects will be stored.

***

### presignPutTtl

> **presignPutTtl**: `number`

Defined in: [shared/types/types.ts:20](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L20)

Time-to-live for presigned PUT URLs in seconds.
Controls how long upload URLs remain valid.

***

### presignGetTtl

> **presignGetTtl**: `number`

Defined in: [shared/types/types.ts:26](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L26)

Time-to-live for presigned GET URLs in seconds.
Controls how long download URLs remain valid.

***

### maxSizeBytes

> **maxSizeBytes**: `number`

Defined in: [shared/types/types.ts:32](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L32)

Maximum allowed object size in bytes.
Files exceeding this size will be rejected.

***

### contentTypeAllowlist

> **contentTypeAllowlist**: `string`[]

Defined in: [shared/types/types.ts:40](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L40)

Allowed content types (MIME types) for uploads.
Only files with these content types will be accepted.

#### Example

```ts
['text/csv', 'application/json']
```
