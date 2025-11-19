[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / VerificationService

# Class: VerificationService

Defined in: services/verification.service.ts:29

Service for verifying uploaded files.

This service validates that uploaded files meet size and content-type requirements.
It should be called after a client uploads to a presigned URL to confirm
the upload was successful and meets policy constraints.

## Example

```typescript
const service = new VerificationService(provider, config);

// Verify an upload
const result = await service.verifyUpload('uploads/123/file.csv');
console.log(result.metadata);
```

## Constructors

### Constructor

> **new VerificationService**(`provider`, `config`): `VerificationService`

Defined in: services/verification.service.ts:36

Creates a new VerificationService instance.

#### Parameters

##### provider

[`StorageProvider`](../interfaces/StorageProvider.md)

Storage provider implementation

##### config

[`VerificationConfig`](../interfaces/VerificationConfig.md)

Verification configuration

#### Returns

`VerificationService`

## Methods

### verifyUpload()

> **verifyUpload**(`key`): `Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Defined in: services/verification.service.ts:67

Verifies that an uploaded file meets size and content-type requirements.

This should be called after a client uploads to a presigned URL
to confirm the upload was successful and meets policy constraints.

#### Parameters

##### key

`string`

Storage key of the uploaded object

#### Returns

`Promise`\<[`VerificationResult`](../interfaces/VerificationResult.md)\>

Verification result with metadata

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
const result = await service.verifyUpload('uploads/1732147200/votes.csv');
// result.key: 'uploads/1732147200/votes.csv'
// result.metadata: {
//   filename: 'votes.csv',
//   ext: 'csv',
//   size: 1024,
//   contentType: 'text/csv',
//   timestamp: 1732147200
// }
```
