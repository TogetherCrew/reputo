# Core Validation System

The Reputo UI uses a unified validation system that ensures **identical validation logic** for algorithm preset forms. All validation is based on `AlgorithmDefinition` types from `@reputo/reputation-algorithms` as the single source of truth.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│        @reputo/reputation-algorithms                     │
│           Single Source of Truth                         │
│         AlgorithmDefinition types                        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Used by
                            │
┌─────────────────────────────────────────────────────────┐
│        @reputo/algorithm-validator                       │
│           Validation Logic                               │
│         buildZodSchema, validatePayload                  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Used by both
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│   Client-Side        │       │   Server-Side        │
│                      │       │                      │
│   ReputoForm         │       │   API Services       │
│   (Browser)          │       │   (NestJS)           │
│                      │       │                      │
│   - Form rendering   │       │   - Payload          │
│   - User input       │       │     validation       │
│   - Live validation  │       │   - Storage          │
└──────────────────────┘       └──────────────────────┘
```

## Core Components

### 1. `@reputo/algorithm-validator`

The validation package provides:

-   `buildZodSchema(definition)` - Converts AlgorithmDefinition to Zod schema
-   `validatePayload(definition, payload)` - Validates data against algorithm definition
-   `validateCSVContent(file, csvConfig)` - Validates CSV files
-   `AlgorithmDefinition` - Re-exported from @reputo/reputation-algorithms

**Uses @reputo/reputation-algorithms as the single source of truth for types.**

### 2. `core/client.ts`

The `reputoClient` provides a convenient API for algorithm definition validation:

```typescript
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms'
import { reputoClient } from '@/core/client'

// Load and register algorithm definition
const definitionJson = getAlgorithmDefinition({ key: 'voting_engagement' })
const definition = JSON.parse(definitionJson) as AlgorithmDefinition
reputoClient.registerSchema(definition)

// Validate payloads
const result = reputoClient.validate('voting_engagement', formData)

// Check result
if (result.success) {
    console.log('Valid:', result.data)
} else {
    console.error('Errors:', result.errors)
}
```

### 3. `core/schema-builder.ts`

Form schema generation utilities for UI:

-   `buildSchemaFromAlgorithm(algorithm)` - Generate FormSchema from Algorithm object
-   Automatically adds name (3-100 chars) and description (10-500 chars) fields
-   Includes key and version as root-level validation fields
-   Transforms algorithm inputs to form inputs
-   `FormSchema` - UI-specific schema structure for form rendering
-   `FormInput` - Flexible input type for UI forms

Note: FormSchema is UI-specific and extends AlgorithmDefinition with additional metadata fields for preset creation.

### 4. `core/reputo-form.tsx`

Uses `buildZodSchema` from @reputo/algorithm-validator to create form validation:

```typescript
import { buildZodSchema } from '@reputo/algorithm-validator'

const zodSchema = buildZodSchema(schema as AlgorithmDefinition)
const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: getDefaultValues(schema, defaultValues),
})
```

## Validation Flow

### Client-Side (Form Submission)

```
1. User fills out form
   ↓
2. Client validates with Zod schema (from validation.ts)
   ↓
3. If valid → onSubmit called with data
   If invalid → error messages shown
   ↓
4. onSubmit transforms data and calls API
   ↓
5. If API returns errors → parse and display
   Dialog stays open to show errors
```

## Schema Structure

### AlgorithmDefinition (from @reputo/reputation-algorithms)

The canonical structure for algorithm definitions:

```typescript
{
  key: "voting_engagement",
  name: "Voting Engagement",
  category: "Engagement",
  description: "...",
  version: "1.0.0",
  inputs: [
    {
      key: "votes",
      label: "Votes CSV",
      type: "csv",
      csv: {
        hasHeader: true,
        delimiter: ",",
        columns: [
          { key: "user_id", type: "string", required: true },
          { key: "vote", type: "enum", enum: ["upvote", "downvote"] }
        ]
      }
    }
  ],
  outputs: [
    {
      key: "scores",
      label: "User Scores",
      type: "csv",
      entity: "user"
    }
  ],
  runtime: {
    taskQueue: "default",
    activity: "calculateVotingEngagement"
  }
}
```

### FormSchema (UI-specific)

When generating a form schema for preset creation, additional fields are added:

```typescript
{
  key: "preset_voting_engagement",
  name: "Create Preset: Voting Engagement",
  category: "Engagement",
  description: "...",
  version: "1.0.0",
  inputs: [
    // Metadata fields for preset creation
    { key: "key", label: "Algorithm Key", type: "text", required: true },
    { key: "version", label: "Version", type: "text", required: true },
    { key: "name", label: "Preset Name", type: "text", required: true, minLength: 3, maxLength: 100 },
    { key: "description", label: "Description", type: "text", required: true, minLength: 10, maxLength: 500 },
    // Algorithm inputs
    { key: "votes", label: "Votes CSV", type: "csv", csv: {...} }
  ],
  outputs: [...]
}
```

## Usage Examples

### Creating a Preset Dialog

```typescript
import { ReputoForm } from '@/core/reputo-form'
import { buildSchemaFromAlgorithm } from '@/core/schema-builder'

function CreatePresetDialog({ algo }) {
    const schema = buildSchemaFromAlgorithm(algo, '1.0.0')

    const handleSubmit = async (data) => {
        // Transform data to CreateAlgorithmPresetDto format
        const createData = {
            key: data.key,
            version: data.version,
            name: data.name,
            description: data.description,
            inputs: algo.inputs.map((input) => ({
                key: input.label,
                value:
                    data[inputKey] instanceof File
                        ? data[inputKey].name
                        : data[inputKey],
            })),
        }

        await onCreatePreset(createData)
    }

    return (
        <ReputoForm
            schema={schema}
            onSubmit={handleSubmit}
            defaultValues={{
                key: algo.id,
                version: '1.0.0',
            }}
        />
    )
}
```

### Error Handling

Backend errors are parsed and displayed:

```typescript
interface BackendError {
    statusCode?: number
    message?:
        | {
              message?: string[]
              error?: string
              statusCode?: number
          }
        | string
}

function parseBackendError(
    error: unknown
): { field: string; message: string }[] {
    // Extract errors from nested structure
    // Map to form fields
    // Return array of { field, message }
}
```

Errors are displayed in the form and the dialog stays open until resolved.

## Field-Specific Validation

Each input type has specific validation rules:

### Text Input

-   `minLength`: Minimum character count
-   `maxLength`: Maximum character count
-   `pattern`: Regex pattern validation

### Number Input

-   `min`: Minimum value
-   `max`: Maximum value

### CSV Input

-   File type validation (.csv)
-   File size limits (maxBytes)
-   Column validation (via CSV config)
-   Content validation (header, rows, columns)

### Boolean Input

-   Simple true/false validation

### Enum Input

-   Must be one of predefined values

### Date Input

-   Date format validation
-   `minDate`: Earliest allowed date
-   `maxDate`: Latest allowed date

### Slider Input

-   Numeric range validation (min-max)

## Best Practices

### ✅ DO

-   Use `@reputo/reputation-algorithms` as the source of truth for algorithm types
-   Use `@reputo/algorithm-validator` for validation logic
-   Use `buildSchemaFromAlgorithm()` to generate form schemas
-   Let ReputoForm handle validation automatically
-   Transform File objects to storage keys when submitting to API
-   Keep dialogs open on validation/API errors
-   Parse backend errors and display them in the form

### ❌ DON'T

-   Duplicate algorithm definition types
-   Add validation logic in UI components
-   Close dialogs on error
-   Bypass the validation system
-   Hardcode validation rules
-   Create custom algorithm types outside of @reputo/reputation-algorithms

## Error Handling

### Backend Error Structure

Backend returns errors in this format:

```json
{
    "statusCode": 400,
    "message": {
        "message": [
            "description must be longer than or equal to 10 characters"
        ],
        "error": "Bad Request",
        "statusCode": 400
    }
}
```

### Error Display

-   Field-level errors: Automatically shown via FormMessage
-   General errors: Displayed in Alert component at top of form
-   Dialog stays open: Prevents user from losing context

## Future Enhancements

-   Server-side validation using `reputoClient.validate()` in API routes
-   Async validation (e.g., checking if preset name exists)
-   Cross-field validation
-   Custom validators per algorithm type
