# @reputo/storage

Framework-agnostic S3 storage layer for the Reputo ecosystem. Provides a reusable abstraction over S3 with type-safe operations, presigned URLs, and configurable constraints.

## Features

-   **Framework-agnostic**: Works with any Node.js application (NestJS, Express, Temporal, etc.)
-   **Provider-agnostic architecture**: Built on pluggable provider interface (S3 included, Azure/GCS easily added)
-   **Type-safe**: Full TypeScript support with comprehensive type definitions
-   **Modular design**: Clean separation between providers, services, and configuration
-   **Service-oriented**: Consolidated I/O and verification services
-   **Error encapsulation**: Provider errors mapped to domain errors (no S3-specific errors leak)
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

The Storage class wraps an injected S3Client instance and provides a high-level API for common operations. See the full API reference in [docs](docs/globals.md).

### Basic Setup

```typescript
import { S3Client } from '@aws-sdk/client-s3'
import { Storage } from '@reputo/storage'

// Create and configure S3Client (once per application)
const s3Client = new S3Client({ region: 'us-east-1' })

// Create Storage instance with configuration
const storage = new Storage(
    {
        bucket: 'my-bucket',
        presignPutTtl: 3600, // Upload URLs valid for 1 hour
        presignGetTtl: 900, // Download URLs valid for 15 minutes
        maxSizeBytes: 104857600, // 100 MB maximum file size
        contentTypeAllowlist: ['text/csv', 'application/json'],
    },
    s3Client
)
```

### Presigned Upload Flow

Generate a presigned URL for client-side uploads, then verify the upload:

```typescript
// 1. Generate presigned upload URL
const upload = await storage.presignPut('votes.csv', 'text/csv')
console.log(upload.key) // 'uploads/1732147200/votes.csv'
console.log(upload.url) // Presigned URL
console.log(upload.expiresIn) // 3600 seconds

// 2. Client uploads to the presigned URL (not shown)

// 3. Verify the upload on the server
const result = await storage.verifyUpload(upload.key)
console.log(result.metadata)
// {
//   filename: 'votes.csv',
//   ext: 'csv',
//   size: 2048,
//   contentType: 'text/csv',
//   timestamp: 1732147200
// }
```

### Presigned Download Flow

Generate a presigned URL for client-side downloads:

```typescript
const download = await storage.presignGet('uploads/1732147200/votes.csv')
console.log(download.url) // Presigned download URL
console.log(download.expiresIn) // 900 seconds
console.log(download.metadata) // Complete file metadata
```

### Direct Object Operations

For server-side operations, read and write objects directly:

```typescript
// Read an object
const buffer = await storage.getObject('uploads/1732147200/votes.csv')
const text = buffer.toString('utf-8')
console.log(text)

// Write an object
const csvData = 'name,score\nAlice,100\nBob,95'
await storage.putObject('uploads/1732147200/results.csv', csvData, 'text/csv')
```

## Integration Examples

### NestJS Application

In a NestJS app, create a provider for S3Client and inject it into a service wrapper:

```typescript
// storage/providers/s3-client.provider.ts
import { S3Client } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'

export const S3_CLIENT = Symbol('S3_CLIENT')

export const s3ClientProvider = {
    provide: S3_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const region = configService.get<string>('aws.region')
        const nodeEnv = configService.get<string>('app.nodeEnv')
        const accessKeyId = configService.get<string>('aws.accessKeyId')
        const secretAccessKey = configService.get<string>('aws.secretAccessKey')

        const config: ConstructorParameters<typeof S3Client>[0] = {
            region,
        }

        // Only use explicit credentials in non-production environments
        if (nodeEnv !== 'production' && accessKeyId && secretAccessKey) {
            config.credentials = {
                accessKeyId,
                secretAccessKey,
            }
        }

        return new S3Client(config)
    },
}

// storage/storage.service.ts
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client } from '@aws-sdk/client-s3'
import { Storage, StorageConfig } from '@reputo/storage'
import { S3_CLIENT } from './providers'

@Injectable()
export class StorageService {
    private readonly storage: Storage

    constructor(
        @Inject(S3_CLIENT) s3Client: S3Client,
        configService: ConfigService
    ) {
        const config: StorageConfig = {
            bucket: configService.get<string>('storage.bucket') as string,
            presignPutTtl: configService.get<number>(
                'storage.presignPutTtl'
            ) as number,
            presignGetTtl: configService.get<number>(
                'storage.presignGetTtl'
            ) as number,
            maxSizeBytes: configService.get<number>(
                'storage.maxSizeBytes'
            ) as number,
            contentTypeAllowlist: (
                configService.get<string>(
                    'storage.contentTypeAllowlist'
                ) as string
            )
                .split(',')
                .map((s) => s.trim()),
        }

        this.storage = new Storage(config, s3Client)
    }

    // Delegate methods to storage instance
    presignPut(filename: string, contentType: string) {
        return this.storage.presignPut(filename, contentType)
    }

    verifyUpload(key: string) {
        return this.storage.verifyUpload(key)
    }

    presignGet(key: string) {
        return this.storage.presignGet(key)
    }
}

// storage/storage.module.ts
import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { s3ClientProvider } from './providers'

@Module({
    providers: [s3ClientProvider, StorageService],
    exports: [StorageService],
})
export class StorageModule {}
```

### Temporal Worker (Algorithm Activities)

In a Temporal worker, create a singleton Storage instance at process startup:

```typescript
// worker/src/storage.ts
import { S3Client } from '@aws-sdk/client-s3'
import { Storage, StorageConfig } from '@reputo/storage'

const s3Client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
})

const config: StorageConfig = {
    bucket: process.env.STORAGE_BUCKET as string,
    presignPutTtl: 0, // Not used by worker
    presignGetTtl: 0, // Not used by worker
    maxSizeBytes: Number(process.env.STORAGE_MAX_SIZE_BYTES ?? 104857600),
    contentTypeAllowlist: (
        process.env.STORAGE_CONTENT_TYPE_ALLOWLIST ??
        'text/csv,application/json'
    )
        .split(',')
        .map((s) => s.trim()),
}

export const storage = new Storage(config, s3Client)

// worker/src/activities/voting-engagement.activity.ts
import { storage } from '../storage'
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types'

export async function voting_engagement(
    payload: WorkerAlgorithmPayload
): Promise<WorkerAlgorithmResult> {
    // Find input location
    const location = payload.inputLocations.find((i) => i.key === 'votes')
    if (!location) {
        throw new Error('Missing "votes" input')
    }

    // Read input data
    const buffer = await storage.getObject(location.value as string)
    const csvText = buffer.toString('utf-8')

    // Process data (algorithm-specific logic here)
    // const rows = parseCsv(csvText);
    // const resultRows = computeVotingEngagement(rows);

    // Write output
    const outputKey = `snapshots/${payload.snapshotId}/outputs/voting_engagement.csv`
    await storage.putObject(outputKey, csvText, 'text/csv')

    return {
        outputs: {
            voting_engagement: outputKey,
        },
    }
}
```

## Provider-Agnostic Architecture

The storage package is built on a pluggable provider interface, making it easy to support multiple storage backends.

### Current Implementation

-   **S3Provider**: Full implementation for AWS S3 (included)

### Adding New Providers

To add support for Azure Blob Storage, Google Cloud Storage, or other providers:

1. **Implement the StorageProvider interface**:

```typescript
import { StorageProvider, ProviderMetadata } from '@reputo/storage'

class AzureBlobProvider implements StorageProvider {
    constructor(private client: BlobServiceClient, private container: string) {}

    async getMetadata(key: string): Promise<ProviderMetadata> {
        // Map Azure metadata to ProviderMetadata
    }

    async createUploadUrl(
        key: string,
        contentType: string,
        ttlSeconds: number
    ): Promise<string> {
        // Generate Azure SAS token
    }

    // ... implement other methods
}
```

2. **Use the new provider**:

```typescript
const blobClient = BlobServiceClient.fromConnectionString(connectionString)
const provider = new AzureBlobProvider(blobClient, 'my-container')
const storage = new Storage(config, provider) // Works the same!
```

### Benefits

-   **Encapsulation**: Provider errors are mapped to domain errors
-   **Consistency**: Same API regardless of storage backend
-   **Flexibility**: Easy to swap providers or support multiple backends

## API Reference

### Storage Class

#### Constructor

```typescript
new Storage(config: StorageConfig, s3Client: S3Client)
```

Creates a new Storage instance.

**Parameters:**

-   `config`: Storage configuration options
-   `s3Client`: Configured S3Client instance

#### Methods

##### `presignPut(filename: string, contentType: string): Promise<UploadUrlResult>`

Generates a presigned URL for uploading a file.

**Throws:**

-   `InvalidContentTypeError` - If content type is not in allowlist

##### `verifyUpload(key: string): Promise<{ key: string; metadata: StorageMetadata }>`

Verifies that an uploaded file meets size and content-type requirements.

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist
-   `HeadObjectFailedError` - If metadata retrieval fails
-   `FileTooLargeError` - If file exceeds max size
-   `InvalidContentTypeError` - If content type is not allowed

##### `presignGet(key: string): Promise<DownloadUrlResult>`

Generates a presigned URL for downloading a file.

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist
-   `HeadObjectFailedError` - If metadata retrieval fails

##### `getObject(key: string): Promise<Buffer>`

Reads an object from S3 and returns its contents as a Buffer.

**Throws:**

-   `ObjectNotFoundError` - If the object doesn't exist

##### `putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string>`

Writes an object to S3.

**Throws:**

-   `InvalidContentTypeError` - If content type is provided and not allowed

### Utility Functions

The storage package exports several utility functions that can be used independently:

#### Key Management

##### `generateUploadKey(filename: string, contentType: string, now?: Date): string`

Generates an S3 key for uploading a file. Keys follow the pattern: `uploads/{timestamp}/{sanitized-filename}.{ext}`

##### `parseStorageKey(key: string): ParsedStorageKey`

Parses a storage key into its component parts.

**Throws:**

-   `InvalidStorageKeyError` - If the key format is invalid

#### Validation

##### `validateFileSize(size: number, maxSizeBytes: number): void`

Validates that a file size is within the allowed maximum. Pure function that can be used independently.

**Example:**

```typescript
import { validateFileSize, FileTooLargeError } from '@reputo/storage'

try {
    validateFileSize(1048576, 1000000) // 1MB file, 1MB limit
} catch (error) {
    if (error instanceof FileTooLargeError) {
        console.log('File too large!')
    }
}
```

**Throws:**

-   `FileTooLargeError` - If size exceeds maxSizeBytes

##### `validateContentType(contentType: string, allowlist: Set<string> | readonly string[]): void`

Validates that a content type is in the allowlist. Pure function that can be used independently.

**Example:**

```typescript
import { validateContentType, InvalidContentTypeError } from '@reputo/storage'

const allowedTypes = new Set(['text/csv', 'application/json'])
try {
    validateContentType('text/csv', allowedTypes) // OK
    validateContentType('image/png', allowedTypes) // throws
} catch (error) {
    if (error instanceof InvalidContentTypeError) {
        console.log('Invalid content type!')
    }
}
```

**Throws:**

-   `InvalidContentTypeError` - If content type is not allowed

#### Metadata

##### `getObjectMetadata(s3Client: S3Client, bucket: string, key: string): Promise<HeadObjectCommandOutput>`

Retrieves object metadata using a HEAD request to S3. Pure utility function that can be used independently.

**Example:**

```typescript
import { S3Client } from '@aws-sdk/client-s3'
import { getObjectMetadata } from '@reputo/storage'

const s3Client = new S3Client({ region: 'us-east-1' })
const metadata = await getObjectMetadata(
    s3Client,
    'my-bucket',
    'uploads/123/file.csv'
)
console.log(metadata.ContentLength, metadata.ContentType)
```

**Throws:**

-   `ObjectNotFoundError` - If object doesn't exist (404)
-   `HeadObjectFailedError` - If metadata retrieval fails for other reasons

## Package Structure

The storage package uses a provider-agnostic architecture with clean separation of concerns:

```
src/
├── storage.ts                         # Main Storage facade
├── config/                            # Configuration interfaces
│   ├── storage.config.ts             # Main config
│   ├── storage-io.config.ts          # I/O config
│   └── verification.config.ts        # Verification config
├── providers/                         # Storage provider implementations
│   ├── storage.provider.ts           # Generic provider interface
│   └── s3/                           # S3 provider
│       └── s3.provider.ts            # S3 implementation with error mapping
├── services/                          # Business logic services
│   ├── storage-io.service.ts         # I/O operations (upload/download/read/write)
│   ├── storage-io.types.ts           # I/O service types
│   ├── verification.service.ts       # Upload verification
│   └── verification.types.ts         # Verification types
├── shared/                            # Shared utilities
│   ├── errors/                       # Domain errors
│   │   ├── base.error.ts            # Base StorageError
│   │   ├── validation.error.ts      # Validation errors
│   │   └── operation.error.ts       # Operation errors
│   ├── types/                        # Shared type definitions
│   │   ├── storage-provider.types.ts # Provider interface types
│   │   ├── s3.types.ts              # S3-specific types
│   │   └── metadata.types.ts        # Metadata types
│   ├── validators/                   # Validation functions
│   │   ├── file-size.validator.ts
│   │   └── content-type.validator.ts
│   └── utils/                        # Utility functions
│       └── keys.ts                   # Key generation and parsing
└── index.ts                           # Main package entry point
```

### Architecture Highlights

-   **Storage (Facade)**: Main API that delegates to services
-   **Providers**: Implement storage backend (S3, Azure, GCS, etc.)
-   **Services**: Business logic (I/O operations, verification)
-   **Config**: First-class configuration interfaces
-   **Shared**: Reusable utilities (errors, types, validators, utils)

## Error Handling

All errors extend the base `StorageError` class, organized into logical categories:

-   **Validation Errors**: Input and configuration validation failures
    -   `FileTooLargeError` - File exceeds maximum size
    -   `InvalidContentTypeError` - Content type not in allowlist
    -   `InvalidStorageKeyError` - Storage key format is invalid
-   **Operation Errors**: S3 operation failures
    -   `ObjectNotFoundError` - Object doesn't exist in S3 (404)
    -   `HeadObjectFailedError` - Metadata retrieval failed

The storage library itself **never logs, formats HTTP responses, or applies any framework-specific behavior**. The library validates inputs, talks to S3, and throws typed errors only. The application layer (e.g. NestJS API, Temporal worker) decides how to map those errors to HTTP status codes, workflow failure states, logging, retries, and so on.

## License

Released under the **GPL-3.0** license. See [LICENSE](../../LICENSE) file for details.

This project is open source and welcomes contributions from the community.
