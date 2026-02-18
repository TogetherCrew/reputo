[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedDownload

# Interface: PresignedDownload

Defined in: [shared/types/types.ts:254](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L254)

Response from generating a presigned download URL.
Includes metadata about the object being downloaded.

## Properties

### url

> **url**: `string`

Defined in: [shared/types/types.ts:259](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L259)

Presigned URL for downloading the file.
Valid for the duration specified in presignGetTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:264](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L264)

Number of seconds until the URL expires.

***

### metadata

> **metadata**: [`StorageMetadata`](StorageMetadata.md)

Defined in: [shared/types/types.ts:269](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L269)

Complete metadata about the object.
