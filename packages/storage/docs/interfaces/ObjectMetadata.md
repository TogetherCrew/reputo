[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ObjectMetadata

# Interface: ObjectMetadata

Defined in: services/storage-io.types.ts:31

Complete metadata about a stored object.

## Properties

### filename

> **filename**: `string`

Defined in: services/storage-io.types.ts:35

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: services/storage-io.types.ts:40

File extension without the dot.

***

### size

> **size**: `number`

Defined in: services/storage-io.types.ts:45

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: services/storage-io.types.ts:50

Content type (MIME type) of the object.

***

### timestamp

> **timestamp**: `number`

Defined in: services/storage-io.types.ts:55

Unix timestamp (seconds since epoch) when the key was generated.
