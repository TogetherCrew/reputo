[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageMetadata

# Interface: StorageMetadata

Defined in: shared/types/types.ts:72

Complete metadata about a stored object.
Includes both parsed key information and S3 object metadata.

## Properties

### filename

> **filename**: `string`

Defined in: shared/types/types.ts:76

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: shared/types/types.ts:81

File extension without the dot.

***

### size

> **size**: `number`

Defined in: shared/types/types.ts:86

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: shared/types/types.ts:91

Content type (MIME type) of the object.

***

### timestamp

> **timestamp**: `number`

Defined in: shared/types/types.ts:96

Unix timestamp (seconds since epoch) when the key was generated.
