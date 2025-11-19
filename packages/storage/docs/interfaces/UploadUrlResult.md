[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / UploadUrlResult

# Interface: UploadUrlResult

Defined in: services/storage-io.types.ts:10

Result from generating a presigned upload URL.

## Properties

### key

> **key**: `string`

Defined in: services/storage-io.types.ts:14

Storage key where the file will be uploaded.

***

### url

> **url**: `string`

Defined in: services/storage-io.types.ts:20

Presigned URL for uploading the file.
Valid for the duration specified in config.

***

### expiresIn

> **expiresIn**: `number`

Defined in: services/storage-io.types.ts:25

Number of seconds until the URL expires.
