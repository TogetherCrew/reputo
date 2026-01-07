**@reputo/algorithm-validator v0.0.0**

***

# @reputo/algorithm-validator

Shared Zod-based validation library for the Reputo ecosystem. Provides schema building, payload validation, and CSV content validation that runs identically on both client and server.

This package is **self-contained** and has no dependencies on other Reputo packages. Algorithm definition types are included for validation purposes.

## Features

- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Zod-based**: Built on Zod v4 for robust runtime validation
- **Universal**: Runs identically in Node.js and browser environments
- **Schema-driven**: Build Zod schemas from AlgorithmDefinition
- **CSV validation**: Comprehensive CSV structure and column validation
- **Algorithm preset validation**: Pre-built schemas for algorithm preset creation
- **Self-contained**: No external Reputo package dependencies

## Installation

```bash
pnpm add @reputo/algorithm-validator
```

## Usage

See the full API reference in [docs](docs/globals.md).

### Payload Validation

Validate data against an AlgorithmDefinition. This works identically on both client and server:

```typescript
import {
    validatePayload,
    type AlgorithmDefinition,
} from '@reputo/algorithm-validator'

// Define or receive an algorithm definition
const definition: AlgorithmDefinition = {
    key: 'voting_engagement',
    name: 'Voting Engagement',
    category: 'Engagement',
    description: 'Calculates engagement based on voting patterns',
    version: '1.0.0',
    inputs: [
        {
            key: 'votes',
            label: 'Votes CSV',
            type: 'csv',
            csv: {
                hasHeader: true,
                delimiter: ',',
                columns: [
                    { key: 'user_id', type: 'string', required: true },
                    { key: 'vote', type: 'enum', enum: ['upvote', 'downvote'] },
                ],
            },
        },
    ],
    outputs: [],
    runtime: { taskQueue: 'default', activity: 'calculateVotingEngagement' },
}

// Validate payload
const result = validatePayload(definition, {
    votes: 'storage-key-for-csv-file',
})

if (result.success) {
    console.log('Valid:', result.data)
} else {
    console.error('Errors:', result.errors)
}
```

### CSV Content Validation

Validate CSV files against column definitions:

```typescript
import { validateCSVContent, type CsvIoItem } from '@reputo/algorithm-validator'

const csvConfig: CsvIoItem['csv'] = {
    hasHeader: true,
    delimiter: ',',
    maxRows: 10000,
    columns: [
        {
            key: 'user_id',
            type: 'string',
            required: true,
            aliases: ['userId', 'user'],
        },
        {
            key: 'vote',
            type: 'enum',
            required: true,
            enum: ['upvote', 'downvote'],
        },
    ],
}

// Browser: validate File object
const fileInput = document.querySelector(
    'input[type="file"]'
) as HTMLInputElement
const file = fileInput.files?.[0]
if (file) {
    const result = await validateCSVContent(file, csvConfig)
    if (result.valid) {
        console.log('CSV is valid')
    } else {
        console.error('CSV validation errors:', result.errors)
    }
}

// Node.js: validate string or Buffer
const csvString = 'user_id,vote,timestamp\n123,upvote,2024-01-01'
const result = await validateCSVContent(csvString, csvConfig)
```

The CSV validator:

- Normalizes column names (handles BOM, spaces, dashes, quotes)
- Validates required columns with alias support
- Checks row count limits
- Validates enum column values
- Detects delimiter automatically if not specified
- Works with File objects (browser), strings, or Buffers (Node.js)

### Algorithm Preset Validation

Validate algorithm preset creation payloads:

```typescript
import {
    validateCreateAlgorithmPreset,
    createAlgorithmPresetSchema,
    type CreateAlgorithmPresetInput,
} from '@reputo/algorithm-validator'

// Validate using the helper function
const result = validateCreateAlgorithmPreset({
    key: 'voting_engagement',
    version: '1.0.0',
    inputs: [{ key: 'votes', value: 'storage-key-123' }],
    name: 'Voting Engagement Algorithm',
    description: 'Calculates engagement based on voting patterns',
})

if (result.success) {
    const preset: CreateAlgorithmPresetInput = result.data
    // Use validated preset data
} else {
    console.error('Validation errors:', result.error)
}

// Or use the schema directly
const zodSchema = createAlgorithmPresetSchema
const parsed = zodSchema.parse(presetData)
```

## Type Definitions

All types are exported from this package:

### Validation Result Types

- `ValidationResult`: Result of payload validation
- `CSVValidationResult`: Result of CSV content validation

### Algorithm Definition Types

- `AlgorithmDefinition`: Complete algorithm definition structure
- `CsvIoItem`: CSV input/output item configuration
- `IoItem`: Union type for all I/O item types
- `AlgorithmCategory`: Supported algorithm categories
- `IoType`: Supported input/output types
- `AlgorithmRuntimeMetadata`: Runtime execution metadata

## Building Zod Schemas

You can build Zod schemas from algorithm definitions for custom validation:

```typescript
import {
    buildZodSchema,
    type InferSchemaType,
    type AlgorithmDefinition,
} from '@reputo/algorithm-validator'

const definition: AlgorithmDefinition = {
    // ... your definition
}

const zodSchema = buildZodSchema(definition)

// Infer TypeScript type from schema
type ValidatedType = InferSchemaType
```

## Development

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build

# Generate documentation
pnpm docs
```

## License

GPL-3.0
