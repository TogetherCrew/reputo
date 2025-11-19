[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / StorageProvider

# Interface: StorageProvider

Defined in: providers/storage.provider.ts:29

Generic storage provider interface.

This interface defines the contract that all storage providers must implement.
It abstracts away provider-specific details and provides a unified API for:
- Metadata retrieval
- Presigned URL generation
- Direct I/O operations

## Example

```typescript
class S3StorageProvider implements StorageProvider {
  async getMetadata(key: string): Promise<ProviderMetadata> {
    // S3-specific implementation
  }
  // ... other methods
}
```

## Methods

### getMetadata()

> **getMetadata**(`key`): `Promise`\<[`ProviderMetadata`](ProviderMetadata.md)\>

Defined in: providers/storage.provider.ts:38

Retrieves metadata for an object.

#### Parameters

##### key

`string`

Storage key of the object

#### Returns

`Promise`\<[`ProviderMetadata`](ProviderMetadata.md)\>

Promise resolving to provider metadata

#### Throws

If object doesn't exist

#### Throws

If metadata retrieval fails

***

### createUploadUrl()

> **createUploadUrl**(`key`, `contentType`, `ttlSeconds`): `Promise`\<`string`\>

Defined in: providers/storage.provider.ts:48

Generates a presigned URL for uploading an object.

#### Parameters

##### key

`string`

Storage key where the object will be stored

##### contentType

`string`

MIME type of the object

##### ttlSeconds

`number`

Time-to-live for the URL in seconds

#### Returns

`Promise`\<`string`\>

Promise resolving to presigned upload URL

***

### createDownloadUrl()

> **createDownloadUrl**(`key`, `ttlSeconds`): `Promise`\<`string`\>

Defined in: providers/storage.provider.ts:58

Generates a presigned URL for downloading an object.

#### Parameters

##### key

`string`

Storage key of the object to download

##### ttlSeconds

`number`

Time-to-live for the URL in seconds

#### Returns

`Promise`\<`string`\>

Promise resolving to presigned download URL

#### Throws

If object doesn't exist

***

### read()

> **read**(`key`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: providers/storage.provider.ts:67

Reads an object and returns its contents.

#### Parameters

##### key

`string`

Storage key of the object to read

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Promise resolving to object contents as Buffer

#### Throws

If object doesn't exist

***

### write()

> **write**(`key`, `body`, `contentType?`): `Promise`\<`void`\>

Defined in: providers/storage.provider.ts:77

Writes an object to storage.

#### Parameters

##### key

`string`

Storage key where the object will be stored

##### body

Object contents

`string` | `Buffer`\<`ArrayBufferLike`\> | `Uint8Array`\<`ArrayBufferLike`\>

##### contentType?

`string`

Optional MIME type

#### Returns

`Promise`\<`void`\>

Promise that resolves when write completes
