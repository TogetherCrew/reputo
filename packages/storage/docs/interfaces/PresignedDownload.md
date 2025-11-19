[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedDownload

# Interface: PresignedDownload

Defined in: [shared/types/types.ts:124](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L124)

Response from generating a presigned download URL.
Includes metadata about the object being downloaded.

## Properties

### url

> **url**: `string`

Defined in: [shared/types/types.ts:129](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L129)

Presigned URL for downloading the file.
Valid for the duration specified in presignGetTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:134](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L134)

Number of seconds until the URL expires.

***

### metadata

> **metadata**: [`StorageMetadata`](StorageMetadata.md)

Defined in: [shared/types/types.ts:139](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/storage/src/shared/types/types.ts#L139)

Complete metadata about the object.
