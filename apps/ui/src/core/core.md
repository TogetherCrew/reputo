# Core Validation System

The Reputo UI uses a unified validation system that ensures **identical validation logic** for algorithm preset forms. All algorithms are automatically registered and schemas are dynamically generated from algorithm definitions.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   core/validation.ts                      │
│              Single Source of Truth                      │
│         All validation logic defined here                │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Used by both
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│   Client-Side        │       │   Server-Side        │
│                      │       │   (Future)            │
│   ReputoForm         │       │                      │
│   (Browser)          │       │   reputoClient       │
│                      │       │   (API Routes)       │
│   - Form rendering   │       │                      │
│   - User input       │       │   - Payload          │
│   - Live validation  │       │     validation       │
└──────────────────────┘       └──────────────────────┘
```

## Core Components

### 1. `core/validation.ts`

The heart of the validation system. Contains:

- `buildZodSchema(schema)` - Converts ReputoSchema to Zod schema
- `buildFieldSchema(input)` - Creates validation for individual fields
- `validatePayload(schema, payload)` - Validates data against schema
- `validateCSVContent(file, config)` - Validates CSV files

**This is the ONLY place where validation rules are defined.**

### 2. `core/client.ts`

The `reputoClient` provides a convenient API:

```typescript
// Register schemas (auto-done for all algorithms)
reputoClient.registerSchema(schema);

// Validate payloads
const result = reputoClient.validate("preset_voting_engagement", formData);

// Check result
if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.error("Errors:", result.errors);
}
```

### 3. `core/schema-builder.ts`

Schema generation utilities:

- `buildSchemaFromAlgorithm(algorithm)` - Generate ReputoSchema from Algorithm object
- Automatically adds name (3-100 chars) and description (10-500 chars) fields
- Includes key and version as root-level validation fields
- Transforms algorithm inputs to ReputoSchema inputs

### 4. `core/reputo-form.tsx`

Uses `buildZodSchema` to create the form validation schema:

```typescript
const zodSchema = buildZodSchema(schema);
const form = useForm({
  resolver: zodResolver(zodSchema),
  defaultValues: getDefaultValues(schema, defaultValues),
});
```

### 5. Auto-Registration

All algorithms are automatically registered when the module loads:

```typescript
// In core/algorithms.ts
algorithms.forEach((algorithm) => {
  const schema = buildSchemaFromAlgorithm(algorithm);
  reputoClient.registerSchema(schema);
});
```

No manual registration needed!

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

When generating a schema from an algorithm, the following structure is created:

```typescript
{
  key: "preset_voting_engagement",
  name: "Create Preset: Voting Engagement",
  category: "Core Engagement",
  description: "...",
  version: "1.0.0",
  inputs: [
    {
      key: "key",
      label: "Algorithm Key",
      type: "text",
      required: true,
      // readonly/disabled in form
    },
    {
      key: "version",
      label: "Version",
      type: "text",
      required: true,
      // readonly/disabled in form
    },
    {
      key: "name",
      label: "Preset Name",
      type: "text",
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    // ... algorithm inputs converted to ReputoSchema inputs
  ],
  outputs: [...]
}
```

## Usage Examples

### Creating a Preset Dialog

```typescript
import { ReputoForm } from "@/core/reputo-form";
import { buildSchemaFromAlgorithm } from "@/core/schema-builder";

function CreatePresetDialog({ algo }) {
  const schema = buildSchemaFromAlgorithm(algo, "1.0.0");
  
  const handleSubmit = async (data) => {
    // Transform data to CreateAlgorithmPresetDto format
    const createData = {
      key: data.key,
      version: data.version,
      name: data.name,
      description: data.description,
      inputs: algo.inputs.map((input) => ({
        key: input.label,
        value: data[inputKey] instanceof File 
          ? data[inputKey].name 
          : data[inputKey],
      })),
    };
    
    await onCreatePreset(createData);
  };

  return (
    <ReputoForm
      schema={schema}
      onSubmit={handleSubmit}
      defaultValues={{
        key: algo.id,
        version: "1.0.0",
      }}
    />
  );
}
```

### Error Handling

Backend errors are parsed and displayed:

```typescript
interface BackendError {
  statusCode?: number;
  message?: {
    message?: string[];
    error?: string;
    statusCode?: number;
  } | string;
}

function parseBackendError(error: unknown): { field: string; message: string }[] {
  // Extract errors from nested structure
  // Map to form fields
  // Return array of { field, message }
}
```

Errors are displayed in the form and the dialog stays open until resolved.

## Field-Specific Validation

Each input type has specific validation rules:

### Text Input
- `minLength`: Minimum character count
- `maxLength`: Maximum character count
- `pattern`: Regex pattern validation

### Number Input
- `min`: Minimum value
- `max`: Maximum value

### CSV Input
- File type validation (.csv)
- File size limits (maxBytes)
- Column validation (via CSV config)
- Content validation (header, rows, columns)

### Boolean Input
- Simple true/false validation

### Enum Input
- Must be one of predefined values

### Date Input
- Date format validation
- `minDate`: Earliest allowed date
- `maxDate`: Latest allowed date

### Slider Input
- Numeric range validation (min-max)

## Best Practices

### ✅ DO

- Use `buildSchemaFromAlgorithm()` to generate schemas
- All algorithms are auto-registered - no manual registration needed
- Let ReputoForm handle validation automatically
- Transform File objects to filenames when submitting to API
- Keep dialogs open on validation/API errors
- Parse backend errors and display them in the form

### ❌ DON'T

- Add validation logic in components
- Manually register algorithm schemas
- Close dialogs on error
- Bypass the validation system
- Hardcode validation rules

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

- Field-level errors: Automatically shown via FormMessage
- General errors: Displayed in Alert component at top of form
- Dialog stays open: Prevents user from losing context

## Future Enhancements

- Server-side validation using `reputoClient.validate()` in API routes
- Async validation (e.g., checking if preset name exists)
- Cross-field validation
- Custom validators per algorithm type

