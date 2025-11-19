[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / S3Provider

# Class: S3Provider

Defined in: providers/s3/s3.provider.ts:32

S3 implementation of the StorageProvider interface.

This provider handles all S3-specific operations and error mapping.
It encapsulates S3Client and bucket details, exposing only the generic interface.

## Example

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { S3Provider } from '@reputo/storage';

const s3Client = new S3Client({ region: 'us-east-1' });
const provider = new S3Provider({
  client: s3Client,
  bucket: 'my-bucket'
});
```

## Implements

- [`StorageProvider`](../interfaces/StorageProvider.md)

## Constructors

### Constructor

> **new S3Provider**(`config`): `S3Provider`

Defined in: providers/s3/s3.provider.ts:41

Creates a new S3Provider instance.

#### Parameters

##### config

[`S3ProviderConfig`](../interfaces/S3ProviderConfig.md)

S3 provider configuration

#### Returns

`S3Provider`

## Methods

### getMetadata()

> **getMetadata**(`key`): `Promise`\<[`ProviderMetadata`](../interfaces/ProviderMetadata.md)\>

Defined in: providers/s3/s3.provider.ts:57

Retrieves metadata for an S3 object.

Maps S3 HeadObject response to generic ProviderMetadata.
All S3 errors are mapped to domain errors.

#### Parameters

##### key

`string`

S3 object key

#### Returns

`Promise`\<[`ProviderMetadata`](../interfaces/ProviderMetadata.md)\>

Promise resolving to provider metadata

#### Throws

If object doesn't exist (404)

#### Throws

If metadata retrieval fails

#### Implementation of

[`StorageProvider`](../interfaces/StorageProvider.md).[`getMetadata`](../interfaces/StorageProvider.md#getmetadata)

***

### createUploadUrl()

> **createUploadUrl**(`key`, `contentType`, `ttlSeconds`): `Promise`\<`string`\>

Defined in: providers/s3/s3.provider.ts:85

Generates a presigned URL for uploading to S3.

#### Parameters

##### key

`string`

S3 object key

##### contentType

`string`

MIME type

##### ttlSeconds

`number`

URL time-to-live in seconds

#### Returns

`Promise`\<`string`\>

Promise resolving to presigned upload URL

#### Implementation of

[`StorageProvider`](../interfaces/StorageProvider.md).[`createUploadUrl`](../interfaces/StorageProvider.md#createuploadurl)

***

### createDownloadUrl()

> **createDownloadUrl**(`key`, `ttlSeconds`): `Promise`\<`string`\>

Defined in: providers/s3/s3.provider.ts:104

Generates a presigned URL for downloading from S3.

#### Parameters

##### key

`string`

S3 object key

##### ttlSeconds

`number`

URL time-to-live in seconds

#### Returns

`Promise`\<`string`\>

Promise resolving to presigned download URL

#### Implementation of

[`StorageProvider`](../interfaces/StorageProvider.md).[`createDownloadUrl`](../interfaces/StorageProvider.md#createdownloadurl)

***

### read()

> **read**(`key`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: providers/s3/s3.provider.ts:124

Reads an object from S3.

All S3 errors are mapped to domain errors.

#### Parameters

##### key

`string`

S3 object key

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Promise resolving to object contents as Buffer

#### Throws

If object doesn't exist

#### Implementation of

[`StorageProvider`](../interfaces/StorageProvider.md).[`read`](../interfaces/StorageProvider.md#read)

***

### write()

> **write**(`key`, `body`, `contentType?`): `Promise`\<`void`\>

Defined in: providers/s3/s3.provider.ts:153

Writes an object to S3.

#### Parameters

##### key

`string`

S3 object key

##### body

Object contents

`string` | `Buffer`\<`ArrayBufferLike`\> | `Uint8Array`\<`ArrayBufferLike`\>

##### contentType?

`string`

Optional MIME type

#### Returns

`Promise`\<`void`\>

Promise that resolves when write completes

#### Implementation of

[`StorageProvider`](../interfaces/StorageProvider.md).[`write`](../interfaces/StorageProvider.md#write)
