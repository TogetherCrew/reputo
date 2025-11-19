[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageIOService

# Class: StorageIOService

Defined in: services/storage-io.service.ts:36

Service for storage I/O operations.

This service consolidates all I/O operations:
- Presigned upload URLs
- Presigned download URLs
- Direct read operations
- Direct write operations

It uses the StorageProvider interface, making it provider-agnostic.

## Example

```typescript
const service = new StorageIOService(provider, config);

// Generate upload URL
const upload = await service.generateUploadUrl('file.csv', 'text/csv');

// Read object
const buffer = await service.readObject('uploads/123/file.csv');
```

## Constructors

### Constructor

> **new StorageIOService**(`provider`, `config`): `StorageIOService`

Defined in: services/storage-io.service.ts:43

Creates a new StorageIOService instance.

#### Parameters

##### provider

[`StorageProvider`](../interfaces/StorageProvider.md)

Storage provider implementation

##### config

[`StorageIOConfig`](../interfaces/StorageIOConfig.md)

I/O operation configuration

#### Returns

`StorageIOService`

## Methods

### generateUploadUrl()

> **generateUploadUrl**(`filename`, `contentType`): `Promise`\<[`UploadUrlResult`](../interfaces/UploadUrlResult.md)\>

Defined in: services/storage-io.service.ts:67

Generates a presigned URL for uploading a file.

The client can use this URL to upload the file directly
without going through your application server.

#### Parameters

##### filename

`string`

Original filename (will be sanitized)

##### contentType

`string`

MIME type of the file

#### Returns

`Promise`\<[`UploadUrlResult`](../interfaces/UploadUrlResult.md)\>

Upload information including the key and presigned URL

#### Throws

If content type is not in allowlist

#### Example

```typescript
const result = await service.generateUploadUrl('votes.csv', 'text/csv');
// result.key: 'uploads/1732147200/votes.csv'
// result.url: 'https://...'
// result.expiresIn: 3600
```

***

### generateDownloadUrl()

> **generateDownloadUrl**(`key`): `Promise`\<[`DownloadUrlResult`](../interfaces/DownloadUrlResult.md)\>

Defined in: services/storage-io.service.ts:100

Generates a presigned URL for downloading a file.

The URL is valid for the duration specified in config.
Also returns metadata about the object.

#### Parameters

##### key

`string`

Storage key of the object to download

#### Returns

`Promise`\<[`DownloadUrlResult`](../interfaces/DownloadUrlResult.md)\>

Download information including presigned URL and metadata

#### Throws

If the object doesn't exist

#### Throws

If metadata retrieval fails

#### Example

```typescript
const result = await service.generateDownloadUrl('uploads/1732147200/votes.csv');
// result.url: 'https://...'
// result.expiresIn: 900
// result.metadata: { filename: 'votes.csv', ... }
```

***

### readObject()

> **readObject**(`key`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: services/storage-io.service.ts:135

Reads an object and returns its contents as a Buffer.

Use this for server-side object reads. For client downloads,
use generateDownloadUrl() instead.

#### Parameters

##### key

`string`

Storage key of the object to read

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Object contents as a Buffer

#### Throws

If the object doesn't exist

#### Example

```typescript
const buffer = await service.readObject('uploads/1732147200/votes.csv');
const text = buffer.toString('utf-8');
```

***

### writeObject()

> **writeObject**(`key`, `body`, `contentType?`): `Promise`\<`string`\>

Defined in: services/storage-io.service.ts:158

Writes an object to storage.

Use this for server-side uploads. For client uploads,
use generateUploadUrl() instead.

#### Parameters

##### key

`string`

Storage key where the object should be stored

##### body

Object contents (Buffer, Uint8Array, or string)

`string` | `Buffer`\<`ArrayBufferLike`\> | `Uint8Array`\<`ArrayBufferLike`\>

##### contentType?

`string`

Optional MIME type (validated if provided)

#### Returns

`Promise`\<`string`\>

The key of the stored object

#### Throws

If content type is provided and not allowed

#### Example

```typescript
const csvData = 'name,score\nAlice,100\nBob,95';
const key = 'uploads/1732147200/results.csv';
await service.writeObject(key, csvData, 'text/csv');
```
