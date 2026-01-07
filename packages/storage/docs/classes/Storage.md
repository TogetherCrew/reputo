[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / Storage

# Class: Storage

Defined in: [storage.ts:89](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L89)

Main storage class that wraps an S3Client instance.

Provides a high-level API for:
- Generating presigned URLs for uploads and downloads
- Verifying uploaded files against size and content-type policies
- Reading and writing objects directly

Each method accepts operation-specific options, allowing callers to
specify bucket, TTLs, size limits, and content type constraints per call.

The Storage instance does NOT create its own S3Client.
Applications must inject a configured S3Client instance.

## Example

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { Storage } from '@reputo/storage';

const s3Client = new S3Client({ region: 'us-east-1' });
const storage = new Storage(s3Client);

// Generate upload URL with per-call options
const upload = await storage.presignPut({
  bucket: 'my-bucket',
  filename: 'data.csv',
  contentType: 'text/csv',
  ttl: 3600,
  maxSizeBytes: 104857600,
  contentTypeAllowlist: ['text/csv', 'application/json'],
});
console.log(upload.key, upload.url);

// Verify upload with per-call options
const result = await storage.verify({
  bucket: 'my-bucket',
  key: upload.key,
  maxSizeBytes: 104857600,
  contentTypeAllowlist: ['text/csv', 'application/json'],
});
console.log(result.metadata);

// Generate download URL with per-call options
const download = await storage.presignGet({
  bucket: 'my-bucket',
  key: upload.key,
  ttl: 900,
});
console.log(download.url);
```

## Constructors

### Constructor

> **new Storage**(`s3Client`): `Storage`

Defined in: [storage.ts:95](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L95)

Creates a new Storage instance.

#### Parameters

##### s3Client

`S3Client`

Configured S3Client instance to use for all operations

#### Returns

`Storage`

## Methods

### presignPut()

> **presignPut**(`options`): `Promise`\<[`PresignedUpload`](../interfaces/PresignedUpload.md)\>

Defined in: [storage.ts:122](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L122)

Generates a presigned URL for uploading a file.

The client can use this URL to upload the file directly to S3
without going through your application server.

#### Parameters

##### options

[`PresignPutOptions`](../interfaces/PresignPutOptions.md)

Upload operation options

#### Returns

`Promise`\<[`PresignedUpload`](../interfaces/PresignedUpload.md)\>

Upload information including the key and presigned URL

#### Throws

If content type is not in allowlist

#### Example

```typescript
const result = await storage.presignPut({
  bucket: 'my-bucket',
  filename: 'votes.csv',
  contentType: 'text/csv',
  ttl: 3600,
  maxSizeBytes: 104857600,
  contentTypeAllowlist: ['text/csv'],
});
// result.key: 'uploads/{uuid}/votes.csv'
// result.url: 'https://bucket.s3.amazonaws.com/...'
// result.expiresIn: 3600
```

***

### verify()

> **verify**(`options`): `Promise`\<\{ `key`: `string`; `metadata`: [`StorageMetadata`](../interfaces/StorageMetadata.md); \}\>

Defined in: [storage.ts:180](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L180)

Verifies that a file meets size requirements and optionally content-type policies.

Supports all key patterns:
- Upload keys (`uploads/...`): validates size AND content type against allowlist
- Snapshot keys (`snapshots/...`): validates size only (internal use)

#### Parameters

##### options

[`VerifyOptions`](../interfaces/VerifyOptions.md)

Verify operation options

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
const result = await storage.verify({
  bucket: 'my-bucket',
  key: 'uploads/{uuid}/votes.csv',
  maxSizeBytes: 104857600,
  contentTypeAllowlist: ['text/csv'],
});

// Verify a snapshot (skips content type validation)
const result = await storage.verify({
  bucket: 'my-bucket',
  key: 'snapshots/abc123/voting_engagement.csv',
  maxSizeBytes: 104857600,
});
```

***

### presignGet()

> **presignGet**(`options`): `Promise`\<[`PresignedDownload`](../interfaces/PresignedDownload.md)\>

Defined in: [storage.ts:245](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L245)

Generates a presigned URL for downloading a file.

Supports all key patterns:
- Upload keys: `uploads/{uuid}/{filename}.{ext}`
- Snapshot keys: `snapshots/{snapshotId}/{filename}.{ext}`

The timestamp in metadata is set to the current Unix timestamp for all key types.

#### Parameters

##### options

[`PresignGetOptions`](../interfaces/PresignGetOptions.md)

Download operation options

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
const result = await storage.presignGet({
  bucket: 'my-bucket',
  key: 'uploads/{uuid}/votes.csv',
  ttl: 900,
});

// Download a snapshot
const result = await storage.presignGet({
  bucket: 'my-bucket',
  key: 'snapshots/abc123/voting_engagement.csv',
  ttl: 900,
});
```

***

### getObject()

> **getObject**(`options`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [storage.ts:298](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L298)

Reads an object from S3 and returns its contents as a Buffer.

Use this for server-side object reads. For client downloads,
use presignGet() to generate a download URL instead.

#### Parameters

##### options

[`GetObjectOptions`](../interfaces/GetObjectOptions.md)

Read operation options

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Object contents as a Buffer

#### Throws

If the object doesn't exist

#### Example

```typescript
const buffer = await storage.getObject({
  bucket: 'my-bucket',
  key: 'uploads/{uuid}/votes.csv',
});
const text = buffer.toString('utf-8');
console.log(text);
```

***

### putObject()

> **putObject**(`options`): `Promise`\<`string`\>

Defined in: [storage.ts:367](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/storage.ts#L367)

Writes an object to S3.

Use this for server-side uploads. For client uploads,
use presignPut() to generate an upload URL instead.

Content type validation is only applied for upload keys (`uploads/...`).
Snapshot keys (`snapshots/...`) bypass content type validation for internal use.

#### Parameters

##### options

[`PutObjectOptions`](../interfaces/PutObjectOptions.md)

Write operation options

#### Returns

`Promise`\<`string`\>

The key of the stored object

#### Throws

If content type is not allowed (upload keys only)

#### Example

```typescript
// Upload with content type validation
const csvData = 'name,score\nAlice,100\nBob,95';
await storage.putObject({
  bucket: 'my-bucket',
  key: 'uploads/{uuid}/results.csv',
  body: csvData,
  contentType: 'text/csv',
  contentTypeAllowlist: ['text/csv'],
});

// Snapshot (skips content type validation)
await storage.putObject({
  bucket: 'my-bucket',
  key: 'snapshots/abc123/voting_engagement.csv',
  body: csvData,
  contentType: 'text/csv',
});
```
