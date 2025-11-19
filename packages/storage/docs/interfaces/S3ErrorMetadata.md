[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / S3ErrorMetadata

# Interface: S3ErrorMetadata

Defined in: shared/types/s3.types.ts:27

S3-specific error metadata.

## Properties

### code?

> `optional` **code**: `string`

Defined in: shared/types/s3.types.ts:31

AWS error code (e.g., 'NoSuchKey', 'AccessDenied').

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: shared/types/s3.types.ts:36

HTTP status code from S3 response.

***

### requestId?

> `optional` **requestId**: `string`

Defined in: shared/types/s3.types.ts:41

AWS request ID for debugging.
