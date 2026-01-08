[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / PutObjectOptions

# Interface: PutObjectOptions

Defined in: [shared/types/types.ts:118](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L118)

Options for writing an object to S3.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:122](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L122)

S3 bucket name where the object will be stored.

***

### key

> **key**: `string`

Defined in: [shared/types/types.ts:127](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L127)

S3 key where the object should be stored.

***

### body

> **body**: `string` \| `Buffer`\<`ArrayBufferLike`\> \| `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [shared/types/types.ts:132](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L132)

Object contents to write.

***

### contentType?

> `optional` **contentType**: `string`

Defined in: [shared/types/types.ts:137](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L137)

Optional MIME type for the object.

***

### contentTypeAllowlist?

> `optional` **contentTypeAllowlist**: `string`[]

Defined in: [shared/types/types.ts:143](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/storage/src/shared/types/types.ts#L143)

Optional allowed content types for validation.
Only validated for upload keys, not snapshot keys.
