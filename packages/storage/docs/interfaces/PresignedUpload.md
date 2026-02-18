[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:232](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L232)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:236](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L236)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:242](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L242)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:247](https://github.com/TogetherCrew/reputo/blob/bc7521151e0cf79ab1c29321ef1e6ee87b55063d/packages/storage/src/shared/types/types.ts#L247)

Number of seconds until the URL expires.
