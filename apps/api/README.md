# @reputo/api

NestJS-based REST API for the Reputo ecosystem.

## Features

- **RESTful API**: Type-safe endpoints with OpenAPI/Swagger documentation
- **Scalar API Reference**: Interactive documentation UI at `/reference`
- **URI Versioning**: Built-in API versioning with prefix `/api/v`
- **MongoDB Integration**: Mongoose ODM for type-safe database operations
- **Comprehensive Validation**: Request/response validation using class-validator and class-transformer
- **Security**: Helmet for HTTP security headers and configurable CORS
- **Structured Logging**: Pino-based logging with error interceptor
- **Health Checks**: Built-in `/healthz` endpoint for monitoring
- **Global Error Handling**: Unified exception filters for consistent error responses

## Installation

```bash
pnpm add @reputo/api
```

## Usage

### Development

```bash
# Start development server with hot reload
pnpm --filter @reputo/api dev

# Server runs on http://localhost:3000
```

### Build

```bash
# Build for production
pnpm --filter @reputo/api build

# Run production build
pnpm --filter @reputo/api start
```

### Testing

```bash
# Run unit tests
pnpm --filter @reputo/api test

# Watch mode
pnpm --filter @reputo/api test:watch

# Coverage reporting
pnpm --filter @reputo/api test:cov
```

#### End-to-end (E2E) tests

```bash
# Run E2E tests
pnpm --filter @reputo/api test:e2e

# Watch mode
pnpm --filter @reputo/api test:e2e:watch
```

## API Documentation

### Scalar Interactive Documentation

Comprehensive, interactive API reference powered by Scalar:

- **Local**: [http://localhost:3000/reference](http://localhost:3000/reference)
- **Staging**: [https://api-staging.logid.xyz/reference](https://api-staging.logid.xyz/reference)
- **Production**: [https://api.logid.xyz/reference](https://api.logid.xyz/reference)

### Swagger UI

Traditional Swagger interface:

- **Local**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Staging**: [https://api-staging.logid.xyz/api/docs](https://api-staging.logid.xyz/api/docs)
- **Production**: [https://api.logid.xyz/api/docs](https://api.logid.xyz/api/docs)

## API Endpoints

### Algorithm Presets

Manage algorithm configuration presets with CRUD operations.

**Base Path**: `/api/v1/algorithm-presets`

| Method   | Endpoint | Description                                 |
| -------- | -------- | ------------------------------------------- |
| `POST`   | `/`      | Create a new algorithm preset               |
| `GET`    | `/`      | List all presets (paginated, sortable)      |
| `GET`    | `/:id`   | Get preset by ID                            |
| `PATCH`  | `/:id`   | Update preset (key & version are immutable) |
| `DELETE` | `/:id`   | Delete preset                               |

**Features:**

- Pagination support (`page`, `limit` query params)
- Sorting by field (`sortBy`, `sortOrder`)
- Filtering by algorithm key and version
- Input parameter validation

### Snapshots

Manage algorithm execution snapshots with status tracking and embedded algorithm preset data.

**Base Path**: `/api/v1/snapshots`

| Method | Endpoint | Description                                    |
| ------ | -------- | ---------------------------------------------- |
| `POST` | `/`      | Create a new snapshot (status: `queued`)       |
| `GET`  | `/`      | List snapshots (filtered, paginated, sortable) |
| `GET`  | `/:id`   | Get snapshot by ID                             |

**Features:**

- Status filtering (`status` query param)
- Algorithm key filtering (`key` query param on embedded preset)
- Algorithm version filtering (`version` query param on embedded preset)
- Embedded algorithm preset data (frozen copy mirrors AlgorithmPreset and includes timestamps)
- Pagination and sorting support

### Storage

Manage presigned S3 uploads and downloads with verification.

**Base Path**: `/api/v1/storage`

| Method | Endpoint          | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| `POST` | `/uploads`        | Create presigned PUT URL for upload       |
| `POST` | `/uploads/verify` | Verify uploaded object (size/type checks) |
| `POST` | `/downloads`      | Create presigned GET URL for download     |

### Health Check

**Base Path**: `/healthz`

| Method | Endpoint | Description                          |
| ------ | -------- | ------------------------------------ |
| `GET`  | `/`      | Health check endpoint for monitoring |

## Architecture

The API follows NestJS best practices with a layered architecture:

### Controllers

Handle HTTP requests, routing, and response formatting. Located in feature modules (e.g., `algorithm-preset.controller.ts`, `snapshot.controller.ts`).

### Services

Contain business logic and orchestrate data operations. Services are injected into controllers.

### Repositories

Abstract database operations and provide type-safe MongoDB queries using Mongoose models.

### DTOs (Data Transfer Objects)

Define request/response schemas with validation rules using decorators:

- Input validation: `class-validator`
- Data transformation: `class-transformer`

### Global Pipes & Filters

- **Validation Pipe**: Transforms and validates request data
- **Exception Filter**: Catches and formats errors consistently
- **Logging Interceptor**: Logs errors with Pino logger

## Project Structure

```text
src/
├── algorithm-preset/     # Algorithm preset CRUD module
│   ├── dto/             # Request/response DTOs
│   ├── *.controller.ts  # HTTP endpoints
│   ├── *.service.ts     # Business logic
│   └── *.repository.ts  # Database operations
├── snapshot/            # Snapshot management module
│   ├── dto/
│   ├── *.controller.ts
│   ├── *.service.ts
│   └── *.repository.ts
├── shared/              # Shared utilities
│   ├── dto/            # Pagination DTOs
│   ├── exceptions/     # Custom exceptions
│   ├── filters/       # Exception filters
│   └── pipes/         # Validation pipes
├── config/             # Configuration modules
├── docs/               # Swagger/Scalar setup
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Environment Variables

| Variable                         | Purpose                                    | Default               | Required |
| -------------------------------- | ------------------------------------------ | --------------------- | -------- |
| `NODE_ENV`                       | Runtime environment                        | `development`         | No       |
| `PORT`                           | Server port                                | `3000`                | No       |
| `LOG_LEVEL`                      | Pino log level                             | `info`                | No       |
| `MONGODB_HOST`                   | MongoDB host                               | -                     | Yes      |
| `MONGODB_PORT`                   | MongoDB port                               | -                     | Yes      |
| `MONGODB_USER`                   | MongoDB user                               | -                     | Yes      |
| `MONGODB_PASSWORD`               | MongoDB password                           | -                     | Yes      |
| `MONGODB_DB_NAME`                | MongoDB database name                      | -                     | Yes      |
| `AWS_REGION`                     | AWS region for S3                          | -                     | Yes      |
| `AWS_ACCESS_KEY_ID`              | AWS access key ID                          | -                     | No       |
| `AWS_SECRET_ACCESS_KEY`          | AWS secret access key                      | -                     | No       |
| `STORAGE_BUCKET`                 | S3 bucket name for storage                 | -                     | Yes      |
| `STORAGE_PRESIGN_PUT_TTL`        | Presigned PUT URL TTL (seconds)            | `120`                 | No       |
| `STORAGE_PRESIGN_GET_TTL`        | Presigned GET URL TTL (seconds)            | `300`                 | No       |
| `STORAGE_MAX_SIZE_BYTES`         | Maximum file size in bytes                 | `52428800` (50 MB)    | No       |
| `STORAGE_CONTENT_TYPE_ALLOWLIST` | Comma-separated list of allowed MIME types | `text/csv,text/plain` | No       |

See `envs.example` for a complete template and descriptions.

## License

Released under the **GPL-3.0** license. See [LICENSE](../../LICENSE) file for details.

This project is open source and welcomes contributions from the community.
