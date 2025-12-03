**@reputo/algorithm-validator v0.0.0**

***

# @reputo/algorithm-validator

Shared Zod-based validation library for the Reputo ecosystem. Provides schema building, payload validation, and CSV content validation that runs identically on both client and server.

## Features

-   **Type-safe**: Full TypeScript support with comprehensive type definitions
-   **Zod-based**: Built on Zod v4 for robust runtime validation
-   **Universal**: Runs identically in Node.js and browser environments
-   **Schema-driven**: Build Zod schemas from ReputoSchema definitions
-   **CSV validation**: Comprehensive CSV structure and column validation
-   **Algorithm preset validation**: Pre-built schemas for algorithm preset creation

## Installation

```bash
pnpm add @reputo/algorithm-validator
```

## Usage

See the full API reference in [docs](docs/globals.md).

### Payload Validation

Validate data against a ReputoSchema definition. This works identically on both client and server:

```typescript
import { validatePayload, type ReputoSchema } from '@reputo/algorithm-validator'

const schema: ReputoSchema = {
    key: 'voting_engagement',
    name: 'Voting Engagement Algorithm',
    category: 'engagement',
    description: 'Calculates engagement based on voting patterns',
    version: '1.0.0',
    inputs: [
        {
            key: 'threshold',
            label: 'Threshold',
            type: 'number',
            min: 0,
            max: 1,
            required: true,
        },
        {
            key: 'weight',
            label: 'Weight',
            type: 'number',
            min: 0,
            required: true,
        },
        {
            key: 'algorithm_name',
            label: 'Algorithm Name',
            type: 'text',
            minLength: 3,
            maxLength: 50,
            required: false,
        },
    ],
    outputs: [
        {
            key: 'score',
            label: 'Engagement Score',
            type: 'number',
        },
    ],
}

// Validate payload
const result = validatePayload(schema, {
    threshold: 0.5,
    weight: 1.2,
    algorithm_name: 'Voting Engagement',
})

if (result.success) {
    console.log('Valid data:', result.data)
} else {
    console.error('Validation errors:', result.errors)
    // [
    //   { field: 'threshold', message: 'Threshold must be at least 0', code: 'too_small' },
    //   ...
    // ]
}
```

### Building Zod Schemas

Build a Zod schema from a ReputoSchema definition for advanced use cases:

```typescript
import {
    buildZodSchema,
    type InferSchemaType,
    type ReputoSchema,
} from '@reputo/algorithm-validator'

const schema: ReputoSchema = {
    // ... schema definition
}

const zodSchema = buildZodSchema(schema)

// Use the schema directly
const parsed = zodSchema.parse({ threshold: 0.5, weight: 1.2 })

// Infer TypeScript types from the schema
type SchemaType = InferSchemaType<typeof schema>
```

### CSV Content Validation

Validate CSV files for structure, required columns, and data constraints. Works with File objects (browser), strings, or Buffers (Node.js):

```typescript
import { validateCSVContent, type CSVConfig } from '@reputo/algorithm-validator'

const csvConfig: CSVConfig = {
    hasHeader: true,
    delimiter: ',',
    maxRows: 10000,
    maxBytes: 10485760, // 10 MB
    columns: [
        {
            key: 'user_id',
            type: 'string',
            required: true,
            aliases: ['userId', 'user-id', 'user id'],
        },
        {
            key: 'vote',
            type: 'enum',
            required: true,
            enum: ['upvote', 'downvote', 'neutral'],
        },
        {
            key: 'timestamp',
            type: 'date',
            required: false,
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
    inputs: [
        { key: 'threshold', value: 0.5 },
        { key: 'weight', value: 1.2 },
    ],
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

## Input Types

The validator supports various input types with specific validation rules:

-   **text**: String input with min/max length and pattern validation
-   **number**: Numeric input with min/max constraints
-   **boolean**: Boolean true/false values
-   **date**: Date strings with min/max date constraints
-   **enum**: Selection from predefined options
-   **csv**: CSV file input with column validation
-   **slider**: Numeric input with min/max range (for UI sliders)

## Integration Examples

### NestJS Backend

```typescript
import { validatePayload, type ReputoSchema } from '@reputo/algorithm-validator'
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms/api'

@Injectable()
export class AlgorithmPresetService {
    async validatePresetInputs(key: string, version: string, inputs: unknown) {
        // Get algorithm definition
        const definitionJson = getAlgorithmDefinition({ key, version })
        const definition = JSON.parse(definitionJson) as AlgorithmDefinition

        // Convert to ReputoSchema format
        const schema: ReputoSchema = {
            key: definition.key,
            name: definition.name,
            category: definition.category,
            description: definition.description,
            version: definition.version,
            inputs: definition.inputs,
            outputs: definition.outputs,
        }

        // Validate inputs
        const result = validatePayload(schema, inputs)
        if (!result.success) {
            throw new BadRequestException({
                message: 'Invalid preset inputs',
                errors: result.errors,
            })
        }

        return result.data
    }
}
```

### React Frontend

```typescript
import {
    validatePayload,
    validateCSVContent,
    type ReputoSchema,
    type CSVConfig,
} from '@reputo/algorithm-validator'
import { useForm } from 'react-hook-form'

function AlgorithmPresetForm({ schema }: { schema: ReputoSchema }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data: unknown) => {
        // Validate form data
        const result = validatePayload(schema, data)
        if (!result.success) {
            // Handle validation errors
            return
        }

        // Validate CSV files if any
        for (const input of schema.inputs) {
            if (input.type === 'csv' && data[input.key] instanceof File) {
                const csvResult = await validateCSVContent(
                    data[input.key],
                    input.csv
                )
                if (!csvResult.valid) {
                    // Handle CSV validation errors
                    return
                }
            }
        }

        // Submit validated data
    }

    return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>
}
```

## API Reference

### Core Functions

#### `validatePayload(schema: ReputoSchema, payload: unknown): ValidationResult`

Validates data against a ReputoSchema definition. Returns a result object with either validated data or error details.

#### `buildZodSchema(reputoSchema: ReputoSchema): z.ZodObject<...>`

Builds a Zod schema from a ReputoSchema definition. Useful for advanced validation scenarios or type inference.

#### `validateCSVContent(file: File | string | Buffer, csvConfig: CSVConfig): Promise<CSVValidationResult>`

Validates CSV content for structure, required columns, and data constraints. Works in both browser and Node.js environments.

### Schema Functions

#### `validateCreateAlgorithmPreset(data: unknown): SafeParseReturnType<...>`

Validates algorithm preset creation payloads using Zod's safeParse.

#### `createAlgorithmPresetSchema: z.ZodObject<...>`

Zod schema for algorithm preset creation validation.

### Types

See the full API reference in [docs](docs/globals.md) for complete type definitions including:

-   `ReputoSchema` - Algorithm schema definition
-   `Input` types - TextInput, NumberInput, BooleanInput, DateInput, EnumInput, CSVInput, SliderInput
-   `Output` - Algorithm output definition
-   `ValidationResult` - Payload validation result
-   `CSVValidationResult` - CSV validation result
-   `CSVConfig` - CSV validation configuration
-   `ColumnDefinition` - CSV column definition

## License

Released under the **GPL-3.0** license. See [LICENSE](_media/LICENSE) file for details.

This project is open source and welcomes contributions from the community.
