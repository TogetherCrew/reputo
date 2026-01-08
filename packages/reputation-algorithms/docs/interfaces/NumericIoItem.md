[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / NumericIoItem

# Interface: NumericIoItem

Defined in: [shared/types/algorithm.ts:80](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L80)

Numeric input item configuration for algorithm definitions.

## Extends

- `BaseIoItem`

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:28](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L28)

Unique identifier for the I/O item

#### Inherited from

`BaseIoItem.key`

***

### label?

> `optional` **label**: `string`

Defined in: [shared/types/algorithm.ts:30](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L30)

Human-readable label for display purposes

#### Inherited from

`BaseIoItem.label`

***

### description?

> `optional` **description**: `string`

Defined in: [shared/types/algorithm.ts:32](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L32)

Detailed description of the I/O item's purpose and usage

#### Inherited from

`BaseIoItem.description`

***

### type

> **type**: `"number"` \| `"integer"`

Defined in: [shared/types/algorithm.ts:82](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L82)

Type identifier for numeric data

***

### min?

> `optional` **min**: `number`

Defined in: [shared/types/algorithm.ts:84](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L84)

Minimum allowed value

***

### max?

> `optional` **max**: `number`

Defined in: [shared/types/algorithm.ts:86](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L86)

Maximum allowed value

***

### default?

> `optional` **default**: `number`

Defined in: [shared/types/algorithm.ts:88](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L88)

Default value

***

### step?

> `optional` **step**: `number`

Defined in: [shared/types/algorithm.ts:90](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L90)

Step increment for the input

***

### required?

> `optional` **required**: `boolean`

Defined in: [shared/types/algorithm.ts:92](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L92)

Whether this input is required

***

### uiHint?

> `optional` **uiHint**: `object`

Defined in: [shared/types/algorithm.ts:94](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L94)

UI rendering hints

#### widget?

> `optional` **widget**: `string`

Widget type for rendering (e.g., 'slider', 'input')
