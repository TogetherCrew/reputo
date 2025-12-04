[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageConfig

# Interface: StorageConfig

Defined in: [shared/types/types.ts:19](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L19)

Configuration options for the Storage instance.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:23](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L23)

S3 bucket name where objects will be stored.

***

### presignPutTtl

> **presignPutTtl**: `number`

Defined in: [shared/types/types.ts:29](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L29)

Time-to-live for presigned PUT URLs in seconds.
Controls how long upload URLs remain valid.

***

### presignGetTtl

> **presignGetTtl**: `number`

Defined in: [shared/types/types.ts:35](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L35)

Time-to-live for presigned GET URLs in seconds.
Controls how long download URLs remain valid.

***

### maxSizeBytes

> **maxSizeBytes**: `number`

Defined in: [shared/types/types.ts:41](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L41)

Maximum allowed object size in bytes.
Files exceeding this size will be rejected.

***

### contentTypeAllowlist

> **contentTypeAllowlist**: `string`[]

Defined in: [shared/types/types.ts:49](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L49)

Allowed content types (MIME types) for uploads.
Only files with these content types will be accepted.

#### Example

```ts
['text/csv', 'application/json']
```
