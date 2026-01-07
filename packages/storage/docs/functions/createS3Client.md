[**@reputo/storage v0.0.0**](../README.md)

***

[@reputo/storage](../globals.md) / createS3Client

# Function: createS3Client()

> **createS3Client**(`config`, `nodeEnv`): `S3Client`

Defined in: s3-client.ts:68

Creates a configured S3 client instance.

In production environments, credentials are obtained from the environment
(IAM roles, environment variables, etc.) and explicit credentials are ignored.

In non-production environments, explicit credentials can be provided for
local development with services like LocalStack or MinIO.

## Parameters

### config

[`S3ClientConfig`](../interfaces/S3ClientConfig.md)

S3 client configuration options

### nodeEnv

`string`

Current Node.js environment (e.g., 'production', 'development', 'test')

## Returns

`S3Client`

Configured S3Client instance

## Example

```typescript
// Production - uses IAM role or environment credentials
const client = createS3Client({ region: 'us-east-1' }, 'production');

// Development with explicit credentials
const client = createS3Client({
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
}, 'development');

// LocalStack or MinIO
const client = createS3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  forcePathStyle: true,
  accessKeyId: 'test',
  secretAccessKey: 'test',
}, 'development');
```
