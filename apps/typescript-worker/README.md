# `@reputo/typescript-worker`

Temporal worker application for executing TypeScript-based reputation algorithms.

## Overview

This worker:

-   Registers one Temporal **activity per algorithm key** (e.g., `voting_engagement`)
-   Receives payloads from `apps/workflows` containing:
    -   `snapshotId`, `algorithmKey`, `algorithmVersion`
    -   `inputLocations` (storage keys for algorithm inputs)
-   Uses `@reputo/storage` to download inputs and upload outputs
-   Returns **output locations** (storage keys) back to workflows

It does **not**:

-   Talk to MongoDB
-   Orchestrate workflows
-   Validate HTTP input
-   Know anything about HTTP APIs or presets

## Architecture

```
apps/workflows (orchestrator)
    ↓ schedules activity
    ↓
apps/typescript-worker (this app)
    ↓ downloads from S3
    ↓
@reputo/storage
    ↓ uploads to S3
```

## Setup

### Prerequisites

-   Node.js 22+
-   pnpm 9+
-   Temporal server running (local or remote)
-   AWS credentials configured
-   S3 bucket for algorithm inputs/outputs

### Installation

```bash
# From the monorepo root
pnpm install
```

### Configuration

Copy the example environment file and configure:

```bash
cd apps/typescript-worker
cp envs.example .env
```

Edit `.env` to set:

-   `AWS_REGION` - AWS region for S3
-   `STORAGE_BUCKET` - S3 bucket name
-   `TEMPORAL_ADDRESS` - Temporal server address (default: `localhost:7233`)
-   `TEMPORAL_NAMESPACE` - Temporal namespace (default: `default`)
-   `TEMPORAL_TASK_QUEUE` - Task queue name (default: `reputation-algorithms-typescript`)

## Development

### Running the Worker

```bash
# Development mode with hot reload
pnpm dev

# Production build and run
pnpm build
pnpm start
```

### Creating a New Algorithm Activity

Use the scaffold script to generate a new algorithm activity:

```bash
pnpm algorithm:new <algorithm_key>
```

Example:

```bash
pnpm algorithm:new voting_engagement
```

This will:

1. Create `src/activities/<algorithm_key>.activity.ts` with a scaffold
2. Add the export to `src/activities/index.ts`
3. Print next steps

### Implementing an Algorithm

After scaffolding, implement the algorithm in the generated file:

1. **Resolve input locations**:

    ```typescript
    const inputKey = getInputLocation(inputLocations, 'votes')
    ```

2. **Download and parse inputs**:

    ```typescript
    const buffer = await storage.getObject(inputKey)
    const csvText = buffer.toString('utf8')
    const rows = parse(csvText, { columns: true })
    ```

3. **Compute results**:

    ```typescript
    const results = computeResults(rows)
    ```

4. **Serialize and upload outputs**:

    ```typescript
    const outputCsv = stringify(results, { header: true })
    const outputKey = `snapshots/${snapshotId}/outputs/${algorithmKey}.csv`
    await storage.putObject(outputKey, outputCsv, 'text/csv')
    ```

5. **Return output locations**:
    ```typescript
    return {
        outputs: {
            [algorithmKey]: outputKey,
        },
    }
    ```

### Algorithm Definition Contract

For the worker to execute an algorithm, the algorithm definition must specify:

-   `runtime.taskQueue = "typescript-worker"`
-   `runtime.activity = "<algorithm_key>"` (matching the exported function name)

Example:

```typescript
{
  key: "voting_engagement",
  runtime: {
    taskQueue: "reputation-algorithms-typescript",
    activity: "voting_engagement"
  },
  // ... other definition fields
}
```

## Project Structure

```
apps/typescript-worker/
├── src/
│   ├── activities/           # Algorithm activity implementations
│   │   ├── voting_engagement.activity.ts
│   │   ├── utils.ts          # Shared activity utilities
│   │   └── index.ts          # Export all activities
│   ├── config/               # Configuration and environment
│   │   ├── env.ts            # Environment variable loading
│   │   └── logger.ts         # Logging utilities
│   ├── scripts/              # Code generation utilities
│   │   └── scaffold-algorithm.ts
│   ├── types/                # Type definitions
│   │   └── algorithm.ts      # Payload and result types
│   ├── storage.ts            # Shared Storage instance
│   ├── worker/
│   │   └── main.ts           # Temporal worker bootstrap
│   ├── workflows/            # Workflow definitions for local runs
│   │   ├── execute-algorithm.workflow.ts
│   │   └── index.ts
│   └── scripts/              # Code generation utilities
│       └── scaffold-algorithm.ts
├── package.json
├── tsconfig.json
├── envs.example
└── README.md
```

## Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Error Handling

Activities throw on:

-   Missing or invalid `inputLocations`
-   Storage errors (`getObject` / `putObject` failures)
-   Parsing or computation errors

The workflow (in `apps/workflows`) is responsible for:

-   Marking the snapshot as `failed`
-   Recording Temporal metadata
-   Implementing retry policies

## Observability

-   Structured JSON logging via `Logger` class
-   Logs include:
    -   `snapshotId`, `algorithmKey`, `algorithmVersion`
    -   Input and output storage keys
    -   Error details (without raw data)

## Deployment

The worker is containerized and deployed via Docker:

```bash
# Build Docker image
docker build -f docker/Dockerfile --target typescript-worker -t reputo-typescript-worker .

# Run container
docker run --env-file apps/typescript-worker/.env reputo-typescript-worker
```

See `docker/README.md` for deployment details.

## Contributing

-   Follow the monorepo's code style (Biome configuration)
-   Add tests for new activities
-   Keep comments concise and aligned with other Reputo packages
-   Use structured logging for observability
