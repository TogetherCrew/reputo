# @reputo/storage

Framework-agnostic S3 storage layer for the Reputo ecosystem. Provides type-safe operations, presigned URLs, and validation utilities.

## Features

-   **Simple API**: Direct functions without unnecessary abstraction layers
-   **Type-safe**: Full TypeScript support with comprehensive type definitions
-   **Framework-agnostic**: Works with any Node.js application (NestJS, Express, Temporal, etc.)
-   **Presigned URLs**: Generate secure upload and download URLs with configurable TTLs
-   **Validation utilities**: Standalone validator functions for file size and content type
-   **Key management**: Automatic key generation and parsing utilities
-   **Direct operations**: Read and write objects directly when needed
-   **Comprehensive errors**: Well-structured error hierarchy for precise error handling

## Installation

```bash
pnpm add @reputo/storage
```

## Usage

The storage package provides simple functions that take an S3Client and configuration parameters directly.

### Basic Setup

```typescript
import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({ region: 'us-east-1' })
```

### Presigned Upload Flow

```typescript
import { presignPut, verifyUpload } from '@reputo/storage'

const upload = await presignPut(s3Client, {
    bucket: 'my-bucket',
    filename: 'votes.csv',
    contentType: 'text/csv',
    ttl: 3600,
    allowedTypes: ['text/csv', 'application/json'],
})

const result = await verifyUpload(s3Client, {
    bucket: 'my-bucket',
    key: upload.key,
    maxSize: 104857600,
    allowedTypes: ['text/csv', 'application/json'],
})
```

### Presigned Download Flow

```typescript
import { presignGet } from '@reputo/storage'

const download = await presignGet(s3Client, {
    bucket: 'my-bucket',
    key: 'uploads/1732147200/votes.csv',
    ttl: 900,
})
```

### Direct Object Operations

```typescript
import { getObject, putObject } from '@reputo/storage'

const buffer = await getObject(s3Client, {
    bucket: 'my-bucket',
    key: 'uploads/1732147200/votes.csv',
})

await putObject(s3Client, {
    bucket: 'my-bucket',
    key: 'uploads/1732147200/results.csv',
    body: csvData,
    contentType: 'text/csv',
    allowedTypes: ['text/csv', 'application/json'],
})
```

## Integration Examples

### NestJS Application

```typescript
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client } from '@aws-sdk/client-s3'
import { presignPut, verifyUpload, presignGet } from '@reputo/storage'
import { S3_CLIENT } from './providers'

@Injectable()
export class StorageService {
    private readonly bucket: string
    private readonly uploadTtl: number
    private readonly downloadTtl: number
    private readonly maxSize: number
    private readonly allowedTypes: string[]

    constructor(
        @Inject(S3_CLIENT) private readonly s3Client: S3Client,
        configService: ConfigService
    ) {
        this.bucket = configService.get<string>('storage.bucket') as string
        this.uploadTtl = configService.get<number>('storage.presignPutTtl') as number
        this.downloadTtl = configService.get<number>('storage.presignGetTtl') as number
        this.maxSize = configService.get<number>('storage.maxSizeBytes') as number
        this.allowedTypes = (
            configService.get<string>('storage.contentTypeAllowlist') as string
        )
            .split(',')
            .map((s) => s.trim())
    }

    async generateUploadUrl(filename: string, contentType: string) {
        return presignPut(this.s3Client, {
            bucket: this.bucket,
            filename,
            contentType,
            ttl: this.uploadTtl,
            allowedTypes: this.allowedTypes,
        })
    }

    async verifyUpload(key: string) {
        return verifyUpload(this.s3Client, {
            bucket: this.bucket,
            key,
            maxSize: this.maxSize,
            allowedTypes: this.allowedTypes,
        })
    }

    async generateDownloadUrl(key: string) {
        return presignGet(this.s3Client, {
            bucket: this.bucket,
            key,
            ttl: this.downloadTtl,
        })
    }
}
```

### Temporal Worker

```typescript
import { getObject, putObject } from '@reputo/storage'
import { s3Client, storageBucket, allowedTypes } from '../storage'

const buffer = await getObject(s3Client, {
    bucket: storageBucket,
    key: location.value as string,
})

await putObject(s3Client, {
    bucket: storageBucket,
    key: outputKey,
    body: csvText,
    contentType: 'text/csv',
    allowedTypes,
})
```

## API Reference

### Upload Operations

#### `presignPut(s3Client, options)`

Generates a presigned URL for uploading a file.

**Parameters:**

-   `s3Client`: Configured S3Client instance
-   `options`: Upload URL generation options
    -   `bucket`: S3 bucket name
    -   `filename`: Original filename (will be sanitized)
    -   `contentType`: MIME type
    -   `ttl`: URL time-to-live in seconds
    -   `allowedTypes`: Array of allowed content types

**Returns:** `Promise<UploadUrlResult>`

**Throws:**

-   `InvalidContentTypeError` - If content type is not in allowlist

#### `putObject(s3Client, options)`

Directly uploads an object to S3.

**Parameters:**

-   `s3Client`: Configured S3Client instance
-   `options`: Upload options
    -   `bucket`: S3 bucket name
    -   `key`: Storage key
    -   `body`: Object contents (Buffer, Uint8Array, or string)
    -   `contentType`: Optional MIME type
    -   `allowedTypes`: Array of allowed content types

**Returns:** `Promise<string>` - The storage key

**Throws:**

-   `InvalidContentTypeError` - If content type is provided and not allowed

#### `verifyUpload(s3Client, options)`

Verifies that an uploaded file meets size and content-type requirements.

**Parameters:**

-   `s3Client`: Configured S3Client instance
-   `options`: Verification options
    -   `bucket`: S3 bucket name
    -   `key`: Storage key of uploaded object
    -   `maxSize`: Maximum allowed size in bytes
    -   `allowedTypes`: Array of allowed content types

**Returns:** `Promise<VerificationResult>`

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist
-   `HeadObjectFailedError` - If metadata retrieval fails
-   `FileTooLargeError` - If file exceeds max size
-   `InvalidContentTypeError` - If content type is not allowed

### Download Operations

#### `presignGet(s3Client, options)`

Generates a presigned URL for downloading a file.

**Parameters:**

-   `s3Client`: Configured S3Client instance
-   `options`: Download URL generation options
    -   `bucket`: S3 bucket name
    -   `key`: Storage key
    -   `ttl`: URL time-to-live in seconds

**Returns:** `Promise<DownloadUrlResult>`

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist
-   `HeadObjectFailedError` - If metadata retrieval fails

#### `getObject(s3Client, options)`

Reads an object from S3 and returns its contents as a Buffer.

**Parameters:**

-   `s3Client`: Configured S3Client instance
-   `options`: Read options
    -   `bucket`: S3 bucket name
    -   `key`: Storage key

**Returns:** `Promise<Buffer>`

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist

### Utility Functions

#### `generateUploadKey(filename, contentType, now?)`

Generates an S3 key for uploading a file. Keys follow the pattern: `uploads/{timestamp}/{sanitized-filename}.{ext}`

#### `parseStorageKey(key)`

Parses a storage key into its component parts.

**Throws:**

-   `InvalidStorageKeyError` - If the key format is invalid

#### `validateFileSize(size, maxSizeBytes)`

Validates that a file size is within the allowed maximum.

**Throws:**

-   `FileTooLargeError` - If size exceeds maxSizeBytes

#### `validateContentType(contentType, allowlist)`

Validates that a content type is in the allowlist.

**Throws:**

-   `InvalidContentTypeError` - If content type is not allowed

## Package Structure

```
src/
├── api/
│   ├── download.ts
│   ├── upload.ts
│   ├── verify.ts
│   └── index.ts
├── shared/
│   ├── errors/
│   │   ├── api.error.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── errors.ts
│   │   ├── storage.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── keys.ts
│   │   └── index.ts
│   ├── validators/
│   │   ├── content-type.validator.ts
│   │   ├── file-size.validator.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

## Error Handling

All errors extend the base `StorageError` class:

-   **Validation Errors**:
    -   `FileTooLargeError` - File exceeds maximum size
    -   `InvalidContentTypeError` - Content type not in allowlist
    -   `InvalidStorageKeyError` - Storage key format is invalid
-   **Operation Errors**:
    -   `ObjectNotFoundError` - Object doesn't exist in S3 (404)
    -   `HeadObjectFailedError` - Metadata retrieval failed

The storage library validates inputs, talks to S3, and throws typed errors only. The application layer decides how to map those errors to HTTP status codes, workflow failure states, logging, retries, and so on.

## License

Released under the **GPL-3.0** license. See [LICENSE](../../LICENSE) file for details.
