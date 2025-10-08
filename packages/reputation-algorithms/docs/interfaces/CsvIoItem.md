[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / CsvIoItem

# Interface: CsvIoItem

Defined in: [shared/types/algorithm.ts:38](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L38)

CSV input/output item configuration for algorithm definitions.

## Extends

- `BaseIoItem`

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:28](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L28)

Unique identifier for the I/O item

#### Inherited from

`BaseIoItem.key`

***

### label?

> `optional` **label**: `string`

Defined in: [shared/types/algorithm.ts:30](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L30)

Human-readable label for display purposes

#### Inherited from

`BaseIoItem.label`

***

### description?

> `optional` **description**: `string`

Defined in: [shared/types/algorithm.ts:32](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L32)

Detailed description of the I/O item's purpose and usage

#### Inherited from

`BaseIoItem.description`

***

### type

> **type**: `"csv"`

Defined in: [shared/types/algorithm.ts:40](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L40)

Type identifier for CSV data

***

### csv

> **csv**: `object`

Defined in: [shared/types/algorithm.ts:42](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L42)

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

Defined in: [shared/types/algorithm.ts:74](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L74)

Entity type that this CSV data represents (e.g., 'user', 'post', 'comment')
