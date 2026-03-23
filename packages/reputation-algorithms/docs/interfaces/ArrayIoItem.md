[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / ArrayIoItem

# Interface: ArrayIoItem

Defined in: [shared/types/algorithm.ts:158](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L158)

Array input item configuration for algorithm definitions.
Represents arrays of objects with nested properties.

## Extends

- `BaseIoItem`

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:28](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L28)

Unique identifier for the I/O item

#### Inherited from

`BaseIoItem.key`

***

### label?

> `optional` **label**: `string`

Defined in: [shared/types/algorithm.ts:30](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L30)

Human-readable label for display purposes

#### Inherited from

`BaseIoItem.label`

***

### description?

> `optional` **description**: `string`

Defined in: [shared/types/algorithm.ts:32](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L32)

Detailed description of the I/O item's purpose and usage

#### Inherited from

`BaseIoItem.description`

***

### type

> **type**: `"array"`

Defined in: [shared/types/algorithm.ts:159](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L159)

***

### minItems?

> `optional` **minItems**: `number`

Defined in: [shared/types/algorithm.ts:160](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L160)

***

### required?

> `optional` **required**: `boolean`

Defined in: [shared/types/algorithm.ts:161](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L161)

***

### uiHint?

> `optional` **uiHint**: `object`

Defined in: [shared/types/algorithm.ts:162](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L162)

#### widget?

> `optional` **widget**: `string`

#### addButtonLabel?

> `optional` **addButtonLabel**: `string`

#### presets?

> `optional` **presets**: `object`[]

***

### item

> **item**: `object`

Defined in: [shared/types/algorithm.ts:167](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L167)

#### type

> **type**: `"object"`

#### properties

> **properties**: [`ObjectPropertyParam`](ObjectPropertyParam.md)[]
