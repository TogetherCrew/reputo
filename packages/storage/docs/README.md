**@reputo/storage v0.0.0**

***

# @reputo/storage

Framework-agnostic S3 storage layer for the Reputo ecosystem. Provides a reusable abstraction over S3 with type-safe operations, presigned URLs, and configurable constraints.

## Features

- **Framework-agnostic**: Works with any Node.js application (NestJS, Express, Temporal, etc.)
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Class-based API**: Clean, object-oriented interface wrapping S3Client
- **Presigned URLs**: Generate secure upload and download URLs with configurable TTLs
- **Validation**: Enforce file size limits and content type constraints
- **Key management**: Automatic key generation and parsing utilities
- **Direct operations**: Read and write objects directly when needed

## Installation

```bash
pnpm add @reputo/storage
```

## Usage

The Storage class wraps an injected S3Client instance and provides a high-level API for common operations.

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
        return new S3Client({
            region: configService.get<string>('aws.region'),
        })
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

## API Reference

### Storage Class

#### Constructor

```typescript
new Storage(config: StorageConfig, s3Client: S3Client)
```

Creates a new Storage instance.

**Parameters:**

- `config`: Storage configuration options
- `s3Client`: Configured S3Client instance

#### Methods

##### `presignPut(filename: string, contentType: string): Promise<PresignedUpload>`

Generates a presigned URL for uploading a file.

**Throws:**

- `InvalidContentTypeError` - If content type is not in allowlist

##### `verifyUpload(key: string): Promise<{ key: string; metadata: StorageMetadata }>`

Verifies that an uploaded file meets size and content-type requirements.

**Throws:**

- `ObjectNotFoundError` - If the object doesn't exist
- `HeadObjectFailedError` - If metadata retrieval fails
- `FileTooLargeError` - If file exceeds max size
- `InvalidContentTypeError` - If content type is not allowed

##### `presignGet(key: string): Promise<PresignedDownload>`

Generates a presigned URL for downloading a file.

**Throws:**

- `ObjectNotFoundError` - If the object doesn't exist
- `HeadObjectFailedError` - If metadata retrieval fails

##### `getObject(key: string): Promise<Buffer>`

Reads an object from S3 and returns its contents as a Buffer.

**Throws:**

- `ObjectNotFoundError` - If the object doesn't exist

##### `putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string>`

Writes an object to S3.

**Throws:**

- `InvalidContentTypeError` - If content type is provided and not allowed

### Utility Functions

#### `generateUploadKey(filename: string, contentType: string, now?: Date): string`

Generates an S3 key for uploading a file. Keys follow the pattern: `uploads/{timestamp}/{sanitized-filename}.{ext}`

#### `parseStorageKey(key: string): ParsedStorageKey`

Parses a storage key into its component parts.

**Throws:**

- `InvalidStorageKeyError` - If the key format is invalid

### Types

See the full API reference in [docs](docs/globals.md).

## Error Handling

All errors extend the base `StorageError` class. Applications can catch these errors and handle them according to their framework:

```typescript
import {
    FileTooLargeError,
    InvalidContentTypeError,
    ObjectNotFoundError,
    HeadObjectFailedError,
    InvalidStorageKeyError,
} from '@reputo/storage'

try {
    await storage.verifyUpload(key)
} catch (error) {
    if (error instanceof FileTooLargeError) {
        // Return HTTP 400 with max size info
        console.log(`Max size: ${error.maxSizeBytes} bytes`)
    } else if (error instanceof InvalidContentTypeError) {
        // Return HTTP 400 with allowed types
        console.log(`Allowed: ${error.allowedTypes.join(', ')}`)
    } else if (error instanceof ObjectNotFoundError) {
        // Return HTTP 404
    } else if (error instanceof HeadObjectFailedError) {
        // Return HTTP 500
    }
    throw error
}
```

## License

Released under the **GPL-3.0** license. See [LICENSE](_media/LICENSE) file for details.

This project is open source and welcomes contributions from the community.
