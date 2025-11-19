[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageIOConfig

# Interface: StorageIOConfig

Defined in: config/storage-io.config.ts:12

Configuration for storage I/O operations (upload, download, read, write).

This config controls the behavior of presigned URLs and file constraints.

## Properties

### uploadTtlSeconds

> **uploadTtlSeconds**: `number`

Defined in: config/storage-io.config.ts:18

Time-to-live for presigned upload URLs in seconds.

#### Example

```ts
3600 // 1 hour
```

***

### downloadTtlSeconds

> **downloadTtlSeconds**: `number`

Defined in: config/storage-io.config.ts:25

Time-to-live for presigned download URLs in seconds.

#### Example

```ts
900 // 15 minutes
```

***

### maxFileSizeBytes

> **maxFileSizeBytes**: `number`

Defined in: config/storage-io.config.ts:33

Maximum allowed file size in bytes.
Files exceeding this size will be rejected.

#### Example

```ts
104857600 // 100 MB
```

***

### allowedContentTypes

> **allowedContentTypes**: `string`[]

Defined in: config/storage-io.config.ts:41

Allowed content types (MIME types) for uploads.
Only files with these content types will be accepted.

#### Example

```ts
['text/csv', 'application/json', 'text/plain']
```
