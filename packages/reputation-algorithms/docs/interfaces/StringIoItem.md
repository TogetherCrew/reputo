[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / StringIoItem

# Interface: StringIoItem

Defined in: [shared/types/algorithm.ts:115](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L115)

String input item configuration for algorithm definitions.

## Extends

- `BaseIoItem`

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:28](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L28)

Unique identifier for the I/O item

#### Inherited from

`BaseIoItem.key`

***

### label?

> `optional` **label**: `string`

Defined in: [shared/types/algorithm.ts:30](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L30)

Human-readable label for display purposes

#### Inherited from

`BaseIoItem.label`

***

### description?

> `optional` **description**: `string`

Defined in: [shared/types/algorithm.ts:32](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L32)

Detailed description of the I/O item's purpose and usage

#### Inherited from

`BaseIoItem.description`

***

### type

> **type**: `"string"`

Defined in: [shared/types/algorithm.ts:117](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L117)

Type identifier for string data

***

### default?

> `optional` **default**: `string`

Defined in: [shared/types/algorithm.ts:119](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L119)

Default value

***

### required?

> `optional` **required**: `boolean`

Defined in: [shared/types/algorithm.ts:121](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L121)

Whether this input is required

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [shared/types/algorithm.ts:123](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L123)

Minimum length for the string

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [shared/types/algorithm.ts:125](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/reputation-algorithms/src/shared/types/algorithm.ts#L125)

Maximum length for the string
