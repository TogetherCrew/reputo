[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:102](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/types/types.ts#L102)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:106](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/types/types.ts#L106)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:112](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/types/types.ts#L112)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:117](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/storage/src/shared/types/types.ts#L117)

Number of seconds until the URL expires.
