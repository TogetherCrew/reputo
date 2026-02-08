[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PresignPutOptions

# Interface: PresignPutOptions

Defined in: [shared/types/types.ts:22](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L22)

Options for generating a presigned PUT URL.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:26](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L26)

S3 bucket name where the object will be stored.

***

### filename

> **filename**: `string`

Defined in: [shared/types/types.ts:31](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L31)

Original filename for the upload.

***

### contentType

> **contentType**: `string`

Defined in: [shared/types/types.ts:36](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L36)

MIME type of the file being uploaded.

***

### ttl

> **ttl**: `number`

Defined in: [shared/types/types.ts:41](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L41)

Time-to-live for the presigned URL in seconds.

***

### maxSizeBytes

> **maxSizeBytes**: `number`

Defined in: [shared/types/types.ts:46](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L46)

Maximum allowed file size in bytes.

***

### contentTypeAllowlist

> **contentTypeAllowlist**: `string`[]

Defined in: [shared/types/types.ts:51](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L51)

Allowed content types (MIME types) for uploads.
