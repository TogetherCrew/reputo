[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageMetadata

# Interface: StorageMetadata

Defined in: [shared/types/types.ts:201](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L201)

Complete metadata about a stored object.
Includes both parsed key information and S3 object metadata.

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:205](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L205)

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: [shared/types/types.ts:210](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L210)

File extension without the dot.

***

### size

> **size**: `number`

Defined in: [shared/types/types.ts:215](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L215)

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: [shared/types/types.ts:220](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L220)

Content type (MIME type) of the object.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/types.ts:226](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L226)

Unix timestamp (seconds since epoch) when the metadata was retrieved.
For uploads, this is typically the current time. For snapshots, this is also the current time.
