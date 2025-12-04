[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:186](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L186)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:190](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L190)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:196](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L196)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:201](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/storage/src/shared/types/types.ts#L201)

Number of seconds until the URL expires.
