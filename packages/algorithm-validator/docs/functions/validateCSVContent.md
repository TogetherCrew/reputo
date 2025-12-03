[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / validateCSVContent

# Function: validateCSVContent()

> **validateCSVContent**(`file`, `csvConfig`): `Promise`\<[`CSVValidationResult`](../interfaces/CSVValidationResult.md)\>

Defined in: [packages/algorithm-validator/src/csv-validation.ts:109](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/csv-validation.ts#L109)

Validates CSV content against column definitions and constraints.

This function works identically on both client and server, supporting:
- File objects (browser environment)
- String content (universal)
- Buffer objects (Node.js environment)

Validation includes:
- Required column presence (with alias support)
- Row count limits
- Column count consistency
- Enum value validation
- Delimiter detection
- BOM and line ending normalization

## Parameters

### file

File object (browser), string content, or Buffer (Node.js)

`string` | `File` | `Buffer`\<`ArrayBufferLike`\>

### csvConfig

[`CSVConfig`](../interfaces/CSVConfig.md)

Configuration defining expected columns, constraints, and validation rules

## Returns

`Promise`\<[`CSVValidationResult`](../interfaces/CSVValidationResult.md)\>

Promise resolving to a CSVValidationResult with validation status and any errors

## Example

```typescript
const csvConfig: CSVConfig = {
  hasHeader: true,
  delimiter: ',',
  maxRows: 10000,
  columns: [
    { key: 'user_id', type: 'string', required: true, aliases: ['userId'] },
    { key: 'vote', type: 'enum', required: true, enum: ['upvote', 'downvote'] }
  ]
}

// Browser
const result = await validateCSVContent(fileInput.files[0], csvConfig)

// Node.js
const result = await validateCSVContent(csvString, csvConfig)
```
