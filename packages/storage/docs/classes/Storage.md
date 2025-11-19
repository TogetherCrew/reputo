[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / Storage

# Class: Storage

Defined in: [storage.ts:51](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L51)

Main storage class that provides a high-level API for storage operations.

This class serves as a facade over the provider and service layers.
It maintains backward compatibility while using the new modular architecture.

The Storage instance:
- Creates an S3Provider from the injected S3Client
- Initializes StorageIOService and VerificationService
- Delegates all operations to these services

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

Defined in: [storage.ts:63](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L63)

Creates a new Storage instance.

Internally creates an S3Provider and initializes services.

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

> **presignPut**(`filename`, `contentType`): `Promise`\<[`UploadUrlResult`](../interfaces/UploadUrlResult.md)\>

Defined in: [storage.ts:98](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L98)

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

`Promise`\<[`UploadUrlResult`](../interfaces/UploadUrlResult.md)\>

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

### verifyUpload()

> **verifyUpload**(`key`): `Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Defined in: [storage.ts:128](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L128)

Verifies that an uploaded file meets size and content-type requirements.

This should be called after a client uploads to a presigned URL
to confirm the upload was successful and meets policy constraints.

#### Parameters

##### key

`string`

S3 key of the uploaded object

#### Returns

`Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Upload verification result with metadata

#### Throws

If the object doesn't exist

#### Throws

If metadata retrieval fails

#### Throws

If file exceeds max size

#### Throws

If content type is not allowed

#### Example

```typescript
const result = await storage.verifyUpload('uploads/1732147200/votes.csv');
// result.key: 'uploads/1732147200/votes.csv'
// result.metadata: {
//   filename: 'votes.csv',
//   ext: 'csv',
//   size: 1024,
//   contentType: 'text/csv',
//   timestamp: 1732147200
// }
```

***

### presignGet()

> **presignGet**(`key`): `Promise`\<[`DownloadUrlResult`](../interfaces/DownloadUrlResult.md)\>

Defined in: [storage.ts:151](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L151)

Generates a presigned URL for downloading a file.

The URL is valid for the duration specified in presignGetTtl.
Also returns metadata about the object.

#### Parameters

##### key

`string`

S3 key of the object to download

#### Returns

`Promise`\<[`DownloadUrlResult`](../interfaces/DownloadUrlResult.md)\>

Download information including presigned URL and metadata

#### Throws

If the object doesn't exist

#### Throws

If metadata retrieval fails

#### Example

```typescript
const result = await storage.presignGet('uploads/1732147200/votes.csv');
// result.url: 'https://bucket.s3.amazonaws.com/...'
// result.expiresIn: 900
// result.metadata: { filename: 'votes.csv', ... }
```

***

### getObject()

> **getObject**(`key`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [storage.ts:172](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L172)

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

Defined in: [storage.ts:195](https://github.com/TogetherCrew/reputo/blob/b52b09933f6992c7fe8484f1101d0b76fee97141/packages/storage/src/storage.ts#L195)

Writes an object to S3.

Use this for server-side uploads. For client uploads,
use presignPut() to generate an upload URL instead.

#### Parameters

##### key

`string`

S3 key where the object should be stored

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
await storage.putObject(key, csvData, 'text/csv');
```
