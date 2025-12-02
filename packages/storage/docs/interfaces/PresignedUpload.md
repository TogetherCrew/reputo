[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:102](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/types/types.ts#L102)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:106](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/types/types.ts#L106)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:112](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/types/types.ts#L112)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:117](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/storage/src/shared/types/types.ts#L117)

Number of seconds until the URL expires.
