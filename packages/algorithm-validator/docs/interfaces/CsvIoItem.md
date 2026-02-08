[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / CsvIoItem

# Interface: CsvIoItem

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:48](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L48)

CSV input/output item configuration for algorithm definitions.

## Extends

- `BaseIoItem`

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:38](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L38)

Unique identifier for the I/O item

#### Inherited from

`BaseIoItem.key`

***

### label?

> `optional` **label**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:40](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L40)

Human-readable label for display purposes

#### Inherited from

`BaseIoItem.label`

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:42](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L42)

Detailed description of the I/O item's purpose and usage

#### Inherited from

`BaseIoItem.description`

***

### type

> **type**: `"csv"`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:50](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L50)

Type identifier for CSV data

***

### csv

> **csv**: `object`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:52](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L52)

CSV parsing and validation configuration

#### hasHeader?

> `optional` **hasHeader**: `boolean`

Whether the CSV file includes a header row

#### delimiter?

> `optional` **delimiter**: `string`

Character used to separate values (default: comma)

#### maxRows?

> `optional` **maxRows**: `number`

Maximum number of rows to process

#### maxBytes?

> `optional` **maxBytes**: `number`

Maximum file size in bytes

#### columns

> **columns**: `object`[]

Column definitions for data validation and processing

***

### entity?

> `optional` **entity**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:84](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/types/algorithm.ts#L84)

Entity type that this CSV data represents (e.g., 'user', 'post', 'comment')
