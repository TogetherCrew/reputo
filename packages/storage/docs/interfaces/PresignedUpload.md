[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:258](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L258)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:262](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L262)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:268](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L268)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:273](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L273)

Number of seconds until the URL expires.
