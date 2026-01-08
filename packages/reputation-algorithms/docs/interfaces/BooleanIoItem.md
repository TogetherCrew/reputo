[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / BooleanIoItem

# Interface: BooleanIoItem

Defined in: [shared/types/algorithm.ts:103](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L103)

Boolean input item configuration for algorithm definitions.

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

> **type**: `"boolean"`

Defined in: [shared/types/algorithm.ts:105](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L105)

Type identifier for boolean data

***

### default?

> `optional` **default**: `boolean`

Defined in: [shared/types/algorithm.ts:107](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L107)

Default value

***

### required?

> `optional` **required**: `boolean`

Defined in: [shared/types/algorithm.ts:109](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L109)

Whether this input is required
