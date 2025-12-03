[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / CSVConfig

# Interface: CSVConfig

Defined in: [packages/algorithm-validator/src/types.ts:36](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L36)

Configuration for CSV validation.

Defines the structure, constraints, and expected columns for CSV files.

## Properties

### hasHeader

> **hasHeader**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:38](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L38)

Whether the CSV file has a header row

***

### delimiter

> **delimiter**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:40](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L40)

The delimiter character used in the CSV (e.g., ',', ';', '\t')

***

### maxRows?

> `optional` **maxRows**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:42](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L42)

Maximum number of data rows allowed

***

### maxBytes?

> `optional` **maxBytes**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:44](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L44)

Maximum file size in bytes

***

### columns

> **columns**: [`ColumnDefinition`](ColumnDefinition.md)[]

Defined in: [packages/algorithm-validator/src/types.ts:46](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/types.ts#L46)

Array of column definitions that must be present
