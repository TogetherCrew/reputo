[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignedUpload

# Interface: PresignedUpload

Defined in: [shared/types/types.ts:232](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L232)

Response from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/types.ts:236](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L236)

S3 object key where the file should be uploaded.

***

### url

> **url**: `string`

Defined in: [shared/types/types.ts:242](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L242)

Presigned URL for uploading the file.
Valid for the duration specified in presignPutTtl.

***

### expiresIn

> **expiresIn**: `number`

Defined in: [shared/types/types.ts:247](https://github.com/reputo-org/reputo/blob/2457822a52892a2887a09cb66d095a9970ab48c9/packages/storage/src/shared/types/types.ts#L247)

Number of seconds until the URL expires.
