[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageMetadata

# Interface: StorageMetadata

Defined in: shared/types/metadata.types.ts:64

Complete metadata about a stored object.
Includes both parsed key information and S3 object metadata.

This interface combines information from the storage key structure
with actual object metadata retrieved from S3.

## Example

```typescript
const metadata: StorageMetadata = {
  filename: 'votes.csv',
  ext: 'csv',
  size: 1024,
  contentType: 'text/csv',
  timestamp: 1732147200,
};
```

## Properties

### filename

> **filename**: `string`

Defined in: shared/types/metadata.types.ts:68

Full filename including extension.

***

### ext

> **ext**: `string`

Defined in: shared/types/metadata.types.ts:73

File extension without the dot.

***

### size

> **size**: `number`

Defined in: shared/types/metadata.types.ts:78

Object size in bytes.

***

### contentType

> **contentType**: `string`

Defined in: shared/types/metadata.types.ts:85

Content type (MIME type) of the object.

#### Example

```ts
'text/csv'
```

***

### timestamp

> **timestamp**: `number`

Defined in: shared/types/metadata.types.ts:90

Unix timestamp (seconds since epoch) when the key was generated.
