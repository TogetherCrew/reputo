[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / DownloadUrlResult

# Interface: DownloadUrlResult

Defined in: services/storage-io.types.ts:61

Result from generating a presigned download URL.

## Properties

### url

> **url**: `string`

Defined in: services/storage-io.types.ts:66

Presigned URL for downloading the file.
Valid for the duration specified in config.

***

### expiresIn

> **expiresIn**: `number`

Defined in: services/storage-io.types.ts:71

Number of seconds until the URL expires.

***

### metadata

> **metadata**: [`ObjectMetadata`](ObjectMetadata.md)

Defined in: services/storage-io.types.ts:76

Complete metadata about the object.
