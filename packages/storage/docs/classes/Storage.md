[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / Storage

# Class: Storage

Defined in: [storage.ts:62](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L62)

Main storage class that wraps an S3Client instance.

Provides a high-level API for:
- Generating presigned URLs for uploads and downloads
- Verifying uploaded files against size and content-type policies
- Reading and writing objects directly

The Storage instance does NOT create its own S3Client.
Applications must inject a configured S3Client instance.

## Example

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { Storage } from '@reputo/storage';

const s3Client = new S3Client({ region: 'us-east-1' });
const storage = new Storage({
  bucket: 'my-bucket',
  presignPutTtl: 3600,
  presignGetTtl: 900,
  maxSizeBytes: 104857600, // 100 MB
  contentTypeAllowlist: ['text/csv', 'application/json'],
}, s3Client);

// Generate upload URL
const upload = await storage.presignPut('data.csv', 'text/csv');
console.log(upload.key, upload.url);

// Verify upload and get metadata
const result = await storage.verifyUpload(upload.key);
console.log(result.metadata);

// Generate download URL
const download = await storage.presignGet(upload.key);
console.log(download.url);
```

## Constructors

### Constructor

> **new Storage**(`config`, `s3Client`): `Storage`

Defined in: [storage.ts:75](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L75)

Creates a new Storage instance.

#### Parameters

##### config

[`StorageConfig`](../interfaces/StorageConfig.md)

Storage configuration options

##### s3Client

`S3Client`

Configured S3Client instance to use for all operations

#### Returns

`Storage`

## Methods

### presignPut()

> **presignPut**(`filename`, `contentType`): `Promise`\<[`PresignedUpload`](../interfaces/PresignedUpload.md)\>

Defined in: [storage.ts:105](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L105)

Generates a presigned URL for uploading a file.

The client can use this URL to upload the file directly to S3
without going through your application server.

#### Parameters

##### filename

`string`

Original filename (will be sanitized)

##### contentType

`string`

MIME type of the file

#### Returns

`Promise`\<[`PresignedUpload`](../interfaces/PresignedUpload.md)\>

Upload information including the key and presigned URL

#### Throws

If content type is not in allowlist

#### Example

```typescript
const result = await storage.presignPut('votes.csv', 'text/csv');
// result.key: 'uploads/1732147200/votes.csv'
// result.url: 'https://bucket.s3.amazonaws.com/...'
// result.expiresIn: 3600
```

***

### verify()

> **verify**(`key`): `Promise`\<\{ `key`: `string`; `metadata`: [`StorageMetadata`](../interfaces/StorageMetadata.md); \}\>

Defined in: [storage.ts:150](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L150)

Verifies that a file meets size requirements and optionally content-type policies.

Supports all key patterns:
- Upload keys (`uploads/...`): validates size AND content type against allowlist
- Snapshot keys (`snapshots/...`): validates size only (internal use)

#### Parameters

##### key

`string`

S3 key of the object to verify

#### Returns

`Promise`\<\{ `key`: `string`; `metadata`: [`StorageMetadata`](../interfaces/StorageMetadata.md); \}\>

Verification result with metadata

#### Throws

If the object doesn't exist

#### Throws

If metadata retrieval fails

#### Throws

If file exceeds max size

#### Throws

If content type is not allowed (upload keys only)

#### Example

```typescript
// Verify an upload (validates content type)
const result = await storage.verify('uploads/1732147200/votes.csv');

// Verify a snapshot output (skips content type validation)
const result = await storage.verify('snapshots/abc123/outputs/voting_engagement.csv');
```

***

### ~~verifyUpload()~~

> **verifyUpload**(`key`): `Promise`\<\{ `key`: `string`; `metadata`: [`StorageMetadata`](../interfaces/StorageMetadata.md); \}\>

Defined in: [storage.ts:183](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L183)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<\{ `key`: `string`; `metadata`: [`StorageMetadata`](../interfaces/StorageMetadata.md); \}\>

#### Deprecated

Use [verify](#verify) instead. This method is kept for backward compatibility.

***

### presignGet()

> **presignGet**(`key`): `Promise`\<[`PresignedDownload`](../interfaces/PresignedDownload.md)\>

Defined in: [storage.ts:212](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L212)

Generates a presigned URL for downloading a file.

Supports all key patterns:
- Upload keys: `uploads/{timestamp}/{filename}.{ext}`
- Snapshot inputs: `snapshots/{snapshotId}/inputs/{inputName}.{ext}`
- Snapshot outputs: `snapshots/{snapshotId}/outputs/{algorithmKey}.{ext}`

For upload keys, the timestamp is extracted from the key path.
For snapshot keys, the timestamp is set to the current Unix timestamp.

#### Parameters

##### key

`string`

S3 key of the object to download

#### Returns

`Promise`\<[`PresignedDownload`](../interfaces/PresignedDownload.md)\>

Download information including presigned URL and metadata

#### Throws

If the object doesn't exist

#### Throws

If metadata retrieval fails

#### Example

```typescript
// Download an upload
const result = await storage.presignGet('uploads/1732147200/votes.csv');

// Download a snapshot output
const result = await storage.presignGet('snapshots/abc123/outputs/voting_engagement.csv');
```

***

### ~~presignGetForKey()~~

> **presignGetForKey**(`key`): `Promise`\<[`PresignedDownload`](../interfaces/PresignedDownload.md)\>

Defined in: [storage.ts:246](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L246)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`PresignedDownload`](../interfaces/PresignedDownload.md)\>

#### Deprecated

Use [presignGet](#presignget) instead. This method is kept for backward compatibility.

***

### getObject()

> **getObject**(`key`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [storage.ts:267](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L267)

Reads an object from S3 and returns its contents as a Buffer.

Use this for server-side object reads. For client downloads,
use presignGet() to generate a download URL instead.

#### Parameters

##### key

`string`

S3 key of the object to read

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Object contents as a Buffer

#### Throws

If the object doesn't exist

#### Example

```typescript
const buffer = await storage.getObject('uploads/1732147200/votes.csv');
const text = buffer.toString('utf-8');
console.log(text);
```

***

### putObject()

> **putObject**(`key`, `body`, `contentType?`): `Promise`\<`string`\>

Defined in: [storage.ts:324](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/storage.ts#L324)

Writes an object to S3.

Use this for server-side uploads. For client uploads,
use presignPut() to generate an upload URL instead.

Content type validation is only applied for upload keys (`uploads/...`).
Snapshot keys (`snapshots/...`) bypass content type validation for internal use.

#### Parameters

##### key

`string`

S3 key where the object should be stored

##### body

Object contents (Buffer, Uint8Array, or string)

`string` | `Buffer`\<`ArrayBufferLike`\> | `Uint8Array`\<`ArrayBufferLike`\>

##### contentType?

`string`

Optional MIME type (validated for upload keys only)

#### Returns

`Promise`\<`string`\>

The key of the stored object

#### Throws

If content type is not allowed (upload keys only)

#### Example

```typescript
// Upload with content type validation
const csvData = 'name,score\nAlice,100\nBob,95';
const key = 'uploads/1732147200/results.csv';
await storage.putObject(key, csvData, 'text/csv');

// Snapshot output (skips content type validation)
const outputKey = 'snapshots/abc123/outputs/voting_engagement.csv';
await storage.putObject(outputKey, csvData, 'text/csv');
```
