[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageMetadata

# Interface: StorageMetadata

Defined in: [shared/types/types.ts:156](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L156)

Complete metadata about a stored object.
Includes both parsed key information and S3 object metadata.

## Properties

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:160](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L160)

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: [shared/types/types.ts:165](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L165)

File extension without the dot.

***

### size

> **size**: `number`

Defined in: [shared/types/types.ts:170](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L170)

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: [shared/types/types.ts:175](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L175)

Content type (MIME type) of the object.

***

### timestamp

> **timestamp**: `number`

Defined in: [shared/types/types.ts:180](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L180)

Unix timestamp (seconds since epoch) when the key was generated.
