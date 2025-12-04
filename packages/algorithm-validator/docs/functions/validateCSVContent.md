[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / validateCSVContent

# Function: validateCSVContent()

> **validateCSVContent**(`file`, `csvConfig`): `Promise`\<[`CSVValidationResult`](../interfaces/CSVValidationResult.md)\>

Defined in: [packages/algorithm-validator/src/csv-validation.ts:110](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/csv-validation.ts#L110)

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

CSV configuration from CsvIoItem defining expected columns and constraints

#### hasHeader?

`boolean`

Whether the CSV file includes a header row

#### delimiter?

`string`

Character used to separate values (default: comma)

#### maxRows?

`number`

Maximum number of rows to process

#### maxBytes?

`number`

Maximum file size in bytes

#### columns

`object`[]

Column definitions for data validation and processing

## Returns

`Promise`\<[`CSVValidationResult`](../interfaces/CSVValidationResult.md)\>

Promise resolving to a CSVValidationResult with validation status and any errors

## Example

```typescript
const csvConfig: CsvIoItem['csv'] = {
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
