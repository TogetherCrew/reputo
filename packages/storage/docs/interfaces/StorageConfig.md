[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageConfig

# Interface: StorageConfig

Defined in: config/storage.config.ts:27

Main configuration for the Storage class.

This is the configuration interface used when creating a Storage instance.
It maintains backward compatibility with the original API.

## Example

```typescript
const config: StorageConfig = {
  bucket: 'my-bucket',
  presignPutTtl: 3600,
  presignGetTtl: 900,
  maxSizeBytes: 104857600, // 100 MB
  contentTypeAllowlist: ['text/csv', 'application/json'],
};
```

## Properties

### bucket

> **bucket**: `string`

Defined in: config/storage.config.ts:31

S3 bucket name where objects will be stored.

***

### presignPutTtl

> **presignPutTtl**: `number`

Defined in: config/storage.config.ts:39

Time-to-live for presigned PUT URLs in seconds.
Controls how long upload URLs remain valid.

#### Example

```ts
3600 // 1 hour
```

***

### presignGetTtl

> **presignGetTtl**: `number`

Defined in: config/storage.config.ts:47

Time-to-live for presigned GET URLs in seconds.
Controls how long download URLs remain valid.

#### Example

```ts
900 // 15 minutes
```

***

### maxSizeBytes

> **maxSizeBytes**: `number`

Defined in: config/storage.config.ts:55

Maximum allowed object size in bytes.
Files exceeding this size will be rejected.

#### Example

```ts
104857600 // 100 MB
```

***

### contentTypeAllowlist

> **contentTypeAllowlist**: `string`[]

Defined in: config/storage.config.ts:63

Allowed content types (MIME types) for uploads.
Only files with these content types will be accepted.

#### Example

```ts
['text/csv', 'application/json', 'text/plain']
```
