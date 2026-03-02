[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / VerifyOptions

# Interface: VerifyOptions

Defined in: [shared/types/types.ts:77](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L77)

Options for verifying an uploaded object.

## Properties

### bucket

> **bucket**: `string`

Defined in: [shared/types/types.ts:81](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L81)

S3 bucket name where the object is stored.

***

### key

> **key**: `string`

Defined in: [shared/types/types.ts:86](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L86)

S3 key of the object to verify.

***

### maxSizeBytes

> **maxSizeBytes**: `number`

Defined in: [shared/types/types.ts:91](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L91)

Maximum allowed file size in bytes.

***

### contentTypeAllowlist?

> `optional` **contentTypeAllowlist**: `string`[]

Defined in: [shared/types/types.ts:97](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/storage/src/shared/types/types.ts#L97)

Allowed content types (MIME types).
Optional - only validated for upload keys, not snapshot keys.
