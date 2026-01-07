[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedDownload

# Interface: PresignedDownload

Defined in: [shared/types/types.ts:280](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L280)

Response from generating a presigned download URL.
Includes metadata about the object being downloaded.

## Properties

### url

> **url**: `string`

Defined in: [shared/types/types.ts:285](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L285)

Presigned URL for downloading the file.
Valid for the duration specified in presignGetTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:290](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L290)

Number of seconds until the URL expires.

***

### metadata

> **metadata**: [`StorageMetadata`](StorageMetadata.md)

Defined in: [shared/types/types.ts:295](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/storage/src/shared/types/types.ts#L295)

Complete metadata about the object.
