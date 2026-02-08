# @reputo/workflows

Temporal-based workflow orchestration and algorithm execution for Reputo reputation algorithms.

## Overview

This application contains two Temporal Workers:

1. **Orchestrator Worker** - Orchestrates the execution of reputation algorithms, coordinating between MongoDB (for snapshot management) and algorithm activities (for computation).

2. **Algorithm Worker** - Executes TypeScript algorithm implementations, handling data I/O with S3 storage.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       apps/workflows                             │
│                                                                  │
│  ┌────────────────────────┐    ┌────────────────────────────┐   │
│  │   Orchestrator Worker  │    │     Algorithm Worker       │   │
│  │                        │    │                            │   │
│  │  • Fetch Snapshots     │    │  • Dispatch to algorithms  │   │
│  │  • Load definitions    │───▶│  • Execute compute logic   │   │
│  │  • Update status       │    │  • Handle S3 I/O           │   │
│  │  • Coordinate flow     │    │  • Return outputs          │   │
│  └────────────────────────┘    └────────────────────────────┘   │
│              │                              │                    │
│              ▼                              ▼                    │
│         MongoDB                    S3 Storage                    │
│    (Snapshot documents)        (Input/Output files)              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Responsibilities

**Orchestrator Worker:**
- ✅ Fetch `Snapshot` documents from MongoDB
- ✅ Load algorithm definitions from `@reputo/reputation-algorithms`
- ✅ Dispatch execution to algorithm worker via Temporal
- ✅ Update snapshot status and outputs
- ❌ Does NOT perform S3 I/O (handled by algorithm worker)
- ❌ Does NOT implement algorithm logic (handled by algorithm worker)
- ❌ Does NOT validate HTTP input (handled by API)

**Algorithm Worker:**
- ✅ Execute algorithm compute functions
- ✅ Download input data from S3
- ✅ Upload output data to S3
- ✅ Return output locations to orchestrator

## Folder Structure

```
apps/workflows/
├── src/
│   ├── workflows/
│   │   ├── orchestrator.workflow.ts    # Main orchestration workflow
│   │   └── index.ts
│   ├── activities/
│   │   ├── orchestrator/               # Orchestrator activities
│   │   │   ├── database.activities.ts
│   │   │   ├── reputation-algorithm.activities.ts
│   │   │   ├── dependency.activities.ts
│   │   │   └── index.ts
│   │   └── typescript/                 # TypeScript algorithm activities
│   │       ├── algorithms/
│   │       │   ├── voting-engagement/
│   │       │   │   ├── compute.ts
│   │       │   │   └── index.ts
│   │       │   ├── contribution-score/
│   │       │   │   ├── compute.ts
│   │       │   │   └── index.ts
│   │       │   ├── proposal-engagement/
│   │       │   │   ├── compute.ts
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── dispatchAlgorithm.activity.ts
│   │       └── index.ts
│   ├── workers/
│   │   └── typescript/
│   │       ├── orchestrator.worker.ts  # Orchestrator worker bootstrap
│   │       └── algorithm.worker.ts     # Algorithm worker bootstrap
│   ├── shared/
│   │   ├── types/                      # Shared TypeScript types
│   │   └── utils/                      # Utility functions
│   ├── config/
│   │   └── index.ts                    # Environment configuration
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Workflows

### `OrchestratorWorkflow`

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
5. **Resolve dependencies** - Fetch any required external data
6. **Execute algorithm** - Call algorithm worker activity
7. **Update result** - Store outputs (success) or error (failure)

**Example:**

```typescript
import { Client } from '@temporalio/client'

const client = new Client()
await client.workflow.start('OrchestratorWorkflow', {
    taskQueue: 'workflows',
    workflowId: 'snapshot-507f1f77bcf86cd799439011',
    args: [{ snapshotId: '507f1f77bcf86cd799439011' }],
})
```

## Activities

### Orchestrator Activities

#### `getSnapshot`

Fetches a snapshot document by ID.

#### `updateSnapshot`

Partially updates a snapshot document (status, temporal metadata, outputs, error).

#### `getAlgorithmDefinition`

Loads an algorithm definition from the registry.

### Algorithm Activities

#### `dispatchAlgorithm`

Dispatches execution to the appropriate compute function based on the algorithm key.

```typescript
const registry: Record<string, AlgorithmComputeFunction> = {
    voting_engagement: computeVotingEngagement,
    contribution_score: computeContributionScore,
    proposal_engagement: computeProposalEngagement,
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
TEMPORAL_ORCHESTRATOR_TASK_QUEUE=orchestrator-worker
TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE=algorithm-typescript-worker
TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE=algorithm-python-worker

# MongoDB Configuration (Orchestrator only)
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=reputo
MONGODB_PASSWORD=reputo123
MONGODB_DB_NAME=reputo

# AWS/Storage Configuration (Algorithm Worker only)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=eu-central-1
STORAGE_BUCKET=reputo-data

# DeepFunding Portal API (required by config validation)
DEEPFUNDING_API_BASE_URL=https://api.deepfunding.xyz
DEEPFUNDING_API_KEY=
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Run in Development Mode

```bash
# Run orchestrator worker
pnpm dev:orchestrator

# Run algorithm worker
pnpm dev:algorithm
```

### Build

```bash
pnpm build
```

### Run Production Build

```bash
# Run orchestrator worker
pnpm start:orchestrator

# Run algorithm worker
pnpm start:algorithm
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

## Adding New Algorithms

To add a new algorithm, use the unified CLI from the monorepo root:

```bash
pnpm algorithm:create <key> <version>
```

This will:

1. Create an algorithm definition in `packages/reputation-algorithms/src/registry/<key>/<version>.json`
2. Create an algorithm directory in `apps/workflows/src/activities/typescript/algorithms/<key>/`
3. Generate `compute.ts` and `index.ts` scaffolds
4. Update the dispatcher registry
5. Update the algorithms index exports

### Manual Steps After Scaffolding

1. **Edit the algorithm definition** to specify inputs, outputs, and parameters
2. **Implement the compute function** in `compute.ts`
3. **Build and test** the algorithm

### Algorithm Implementation Pattern

```typescript
// apps/workflows/src/activities/typescript/algorithms/my-algorithm/compute.ts

export async function computeMyAlgorithm(
    snapshot: Snapshot,
    storage: Storage
): Promise<AlgorithmResult> {
    const snapshotId = String((snapshot as unknown as { _id: string })._id)
    const { key: algorithmKey, inputs } = snapshot.algorithmPresetFrozen
    const logger = Context.current().log

    // 1. Get input file locations from frozen inputs
    const inputKey = getInputValue(inputs, 'input_data')

    // 2. Download and parse input data
    const buffer = await storage.getObject({ bucket, key: inputKey })
    const rows = parse(buffer.toString('utf8'), { columns: true })

    // 3. Execute algorithm logic
    const results = processData(rows)

    // 4. Upload results to S3
    const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`)
    const outputCsv = stringify(results, { header: true })
    await storage.putObject({ bucket, key: outputKey, body: outputCsv, contentType: 'text/csv' })

    // 5. Return output locations
    return {
        outputs: {
            result: outputKey,
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

## License

GPL-3.0

## Author

Behzad Rabiei - [https://github.com/Behzad-rabiei](https://github.com/Behzad-rabiei)
