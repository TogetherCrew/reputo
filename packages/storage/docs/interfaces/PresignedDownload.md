[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedDownload

# Interface: PresignedDownload

Defined in: [shared/types/types.ts:208](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L208)

Response from generating a presigned download URL.
Includes metadata about the object being downloaded.

## Properties

### url

> **url**: `string`

Defined in: [shared/types/types.ts:213](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L213)

Presigned URL for downloading the file.
Valid for the duration specified in presignGetTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:218](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L218)

Number of seconds until the URL expires.

***

### metadata

> **metadata**: [`StorageMetadata`](StorageMetadata.md)

Defined in: [shared/types/types.ts:223](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/storage/src/shared/types/types.ts#L223)

Complete metadata about the object.
