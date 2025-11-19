[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / ProviderMetadata

# Interface: ProviderMetadata

Defined in: shared/types/storage-provider.types.ts:13

Generic metadata returned by storage providers.

Providers map their specific metadata formats to this common structure.

## Properties

### size

> **size**: `number`

Defined in: shared/types/storage-provider.types.ts:17

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: shared/types/storage-provider.types.ts:22

Content type (MIME type) of the object.

***

### lastModified

> **lastModified**: `Date` \| `undefined`

Defined in: shared/types/storage-provider.types.ts:27

Last modified timestamp.

***

### etag

> **etag**: `string` \| `undefined`

Defined in: shared/types/storage-provider.types.ts:32

Entity tag for the object (for caching/versioning).
