# @reputo/workflows

Temporal-based workflow orchestration for Reputo reputation algorithms.

## Overview

This application runs a Temporal Worker that orchestrates the execution of reputation algorithms defined in `@reputo/reputation-algorithms`. It coordinates between MongoDB (for snapshot management) and algorithm workers (for computation), treating all data as opaque storage locations.

## Architecture

```
┌─────────────────┐
│  apps/workflows │  ← You are here
│  (Orchestrator) │
└────────┬────────┘
         │
         ├─→ MongoDB (read/write Snapshots)
         ├─→ Algorithm Registry (load definitions)
         └─→ Algorithm Workers (dispatch execution)
              └─→ apps/typescript-worker, etc.
```

### Key Responsibilities

- ✅ Fetch `Snapshot` documents from MongoDB
- ✅ Load algorithm definitions from `@reputo/reputation-algorithms`
- ✅ Dispatch execution to algorithm workers via Temporal
- ✅ Update snapshot status and outputs
- ❌ Does NOT perform S3 I/O (handled by workers)
- ❌ Does NOT implement algorithm logic (handled by workers)
- ❌ Does NOT validate HTTP input (handled by API)

## Folder Structure

```
apps/workflows/
├── src/
│   ├── workflows/
│   │   ├── run-snapshot.workflow.ts    # Main orchestration workflow
│   │   └── index.ts
│   ├── activities/
│   │   ├── database.activities.ts       # MongoDB operations
│   │   ├── algorithm-library.activities.ts  # Algorithm registry lookups
│   │   └── index.ts
│   ├── shared/
│   │   ├── types/                       # Shared TypeScript types
│   │   └── constants/                   # Timeout constants, etc.
│   ├── config/
│   │   ├── environment.config.ts        # Env var validation
│   │   ├── logger.config.ts             # Pino logger setup
│   │   ├── database.config.ts           # MongoDB connection
│   │   └── index.ts
│   └── index.ts                         # Worker bootstrap
├── package.json
├── tsconfig.json
└── README.md
```

## Workflows

### `RunSnapshotWorkflow`

Executes a reputation algorithm for a given snapshot ID.

**Input:**

```typescript
{
    snapshotId: string // MongoDB ObjectId
}
```

**Execution Flow:**

1. **Fetch snapshot** - Load snapshot document and frozen preset from MongoDB
2. **Validate state** - Skip if already completed
3. **Mark processing** - Update status to `processing` with Temporal metadata
4. **Load definition** - Get algorithm definition from registry
5. **Build payload** - Construct execution payload with input locations
6. **Execute algorithm** - Call worker activity on configured task queue
7. **Update result** - Store outputs (success) or error (failure)

**Example:**

```typescript
import { Client } from '@temporalio/client'

const client = new Client()
await client.workflow.start('RunSnapshotWorkflow', {
    taskQueue: 'workflows',
    workflowId: 'snapshot-507f1f77bcf86cd799439011',
    args: [{ snapshotId: '507f1f77bcf86cd799439011' }],
})
```

## Activities

### Database Activities

#### `getSnapshot`

Fetches a snapshot document by ID.

**Input:**

```typescript
{
    snapshotId: string
}
```

**Output:**

```typescript
{
    snapshot: Snapshot
}
```

#### `updateSnapshot`

Partially updates a snapshot document.

**Input:**

```typescript
{
  snapshotId: string
  status?: 'queued' | 'processing' | 'completed' | 'failed'
  temporal?: {
    workflowId?: string
    runId?: string
    taskQueue?: string
  }
  outputs?: Record<string, unknown>
  error?: { message: string }
}
```

### Algorithm Library Activities

#### `getAlgorithmDefinition`

Loads an algorithm definition from the registry.

**Input:**

```typescript
{
  key: string
  version?: string | 'latest'
}
```

**Output:**

```typescript
{
    definition: AlgorithmDefinition
}
```

## Configuration

### Environment Variables

Required environment variables (see `envs.example`):

```bash
# Node Environment
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=workflows

# MongoDB Configuration
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=reputo
MONGODB_PASSWORD=reputo123
MONGODB_DB_NAME=reputo
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Run in Development Mode

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Run Production Build

```bash
pnpm start
```

### Code Quality

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Check and fix
pnpm check
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

## Integration with Algorithm Workers

Algorithm workers (e.g., `apps/typescript-worker`) must:

1. **Listen on the correct task queue** - Specified in `AlgorithmDefinition.runtime.taskQueue`
2. **Register activity with correct name** - Specified in `AlgorithmDefinition.runtime.activity`
3. **Accept `WorkflowAlgorithmPayload`** - Contains snapshot ID, algorithm metadata, input locations
4. **Return `WorkflowAlgorithmResult`** - Contains output locations
5. **Handle storage I/O** - Download inputs from S3, upload outputs to S3

Example worker activity signature:

```typescript
async function voting_engagement(
    payload: WorkflowAlgorithmPayload
): Promise<WorkflowAlgorithmResult> {
    // 1. Download inputs from S3 using payload.inputLocations
    // 2. Execute algorithm logic
    // 3. Upload outputs to S3
    // 4. Return output locations
    return {
        outputs: {
            csv: 's3://bucket/outputs/result.csv',
        },
    }
}
```

## Observability

### Logging

The application uses Pino for structured logging:

- **Development:** Pretty-printed colorized output
- **Production:** JSON-formatted logs for log aggregation

Log levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

### Temporal Metadata

Each snapshot stores Temporal workflow metadata:

```typescript
{
  temporal: {
    workflowId: 'snapshot-507f1f77bcf86cd799439011',
    runId: 'abc123...',
    taskQueue: 'workflows'
  }
}
```

This enables:

- Correlation between snapshots and workflow runs
- Debugging failed executions
- Retry and recovery operations

### Monitoring

- **Temporal UI:** View workflow executions, history, and failures
- **MongoDB:** Query snapshot documents by status, timestamps, etc.
- **Logs:** Structured JSON logs for analysis and alerting

## Error Handling

### Workflow Failures

If an algorithm execution fails:

1. The workflow catches the error
2. Updates snapshot status to `failed`
3. Stores error metadata
4. Rethrows the error (marks workflow run as failed)

### Retries

- **Database activities:** Short timeout (1 minute), standard Temporal retries
- **Algorithm activities:** Long timeout (30 minutes), conservative retries (max 3 attempts)

### Recovery

To retry a failed snapshot:

1. Query snapshot by ID
2. Update status from `failed` to `queued`
3. Start a new workflow execution with the same snapshot ID

## Adding New Algorithms

To add a new algorithm:

1. **Define algorithm in `@reputo/reputation-algorithms`**
    - Create JSON definition with inputs/outputs/runtime
    - Specify task queue and activity name

2. **Implement worker activity**
    - Create activity in worker app (e.g., `apps/typescript-worker`)
    - Handle storage I/O via `@reputo/storage`
    - Implement algorithm logic

3. **No changes needed in `apps/workflows`**
    - Workflows automatically route to the correct worker
    - Runtime metadata drives all dispatching

## License

GPL-3.0

## Author

Behzad Rabiei - [https://github.com/Behzad-rabiei](https://github.com/Behzad-rabiei)
