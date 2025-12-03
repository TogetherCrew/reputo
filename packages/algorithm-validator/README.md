# @reputo/algorithm-validator

Shared Zod-based validation library for the Reputo ecosystem. Provides schema building, payload validation, and CSV content validation that runs identically on both client and server.

**Important**: Algorithm definition types (`AlgorithmDefinition`, `CsvIoItem`, etc.) should be imported directly from `@reputo/reputation-algorithms`, not from this package.

## Features

-   **Type-safe**: Full TypeScript support with comprehensive type definitions
-   **Zod-based**: Built on Zod v4 for robust runtime validation
-   **Universal**: Runs identically in Node.js and browser environments
-   **Schema-driven**: Build Zod schemas from AlgorithmDefinition
-   **CSV validation**: Comprehensive CSV structure and column validation
-   **Algorithm preset validation**: Pre-built schemas for algorithm preset creation

## Installation

```bash
pnpm add @reputo/algorithm-validator
```

## Usage

See the full API reference in [docs](docs/globals.md).

### Payload Validation

Validate data against an AlgorithmDefinition. This works identically on both client and server:

```typescript
import { validatePayload } from '@reputo/algorithm-validator'
import {
    getAlgorithmDefinition,
    type AlgorithmDefinition,
} from '@reputo/reputation-algorithms'

// Get algorithm definition from the registry
const definitionJson = getAlgorithmDefinition({
    key: 'voting_engagement',
    version: '1.0.0',
})
const definition = JSON.parse(definitionJson) as AlgorithmDefinition

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
import { validateCSVContent } from '@reputo/algorithm-validator'
import type { CsvIoItem } from '@reputo/reputation-algorithms'

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

-   Normalizes column names (handles BOM, spaces, dashes, quotes)
-   Validates required columns with alias support
-   Checks row count limits
-   Validates enum column values
-   Detects delimiter automatically if not specified
-   Works with File objects (browser), strings, or Buffers (Node.js)

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

### Validation Result Types (from this package)

-   `ValidationResult`: Result of payload validation
-   `CSVValidationResult`: Result of CSV content validation

### Algorithm Types (from @reputo/reputation-algorithms)

Import algorithm definition types directly from `@reputo/reputation-algorithms`:

-   `AlgorithmDefinition`: Complete algorithm definition structure with inputs, outputs, and runtime metadata
-   `CsvIoItem`: CSV input/output item configuration
-   `AlgorithmCategory`, `IoType`, etc.

## Building Zod Schemas

You can build Zod schemas from algorithm definitions for custom validation:

```typescript
import { buildZodSchema, type InferSchemaType } from '@reputo/algorithm-validator'
import type { AlgorithmDefinition } from '@reputo/reputation-algorithms'

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
