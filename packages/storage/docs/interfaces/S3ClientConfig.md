[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / S3ClientConfig

# Interface: S3ClientConfig

Defined in: s3-client.ts:12

Configuration options for creating an S3 client.

## Properties

### region

> **region**: `string`

Defined in: s3-client.ts:18

AWS region for S3 operations.

#### Example

```ts
'us-east-1'
```

***

### accessKeyId?

> `optional` **accessKeyId**: `string`

Defined in: s3-client.ts:24

AWS access key ID.
Only used in non-production environments when explicitly provided.

***

### secretAccessKey?

> `optional` **secretAccessKey**: `string`

Defined in: s3-client.ts:30

AWS secret access key.
Only used in non-production environments when explicitly provided.
