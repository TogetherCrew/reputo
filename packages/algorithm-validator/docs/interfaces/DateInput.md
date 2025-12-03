[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / DateInput

# Interface: DateInput

Defined in: [packages/algorithm-validator/src/types.ts:104](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L104)

Date input with min/max date constraints.

## Extends

- [`BaseInput`](BaseInput.md)

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:61](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L61)

Unique key identifier for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`key`](BaseInput.md#key)

***

### label

> **label**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:63](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L63)

Human-readable label for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`label`](BaseInput.md#label)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:65](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L65)

Optional description of the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`description`](BaseInput.md#description)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:67](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L67)

Whether the input is required (default: true)

#### Inherited from

[`BaseInput`](BaseInput.md).[`required`](BaseInput.md#required)

***

### type

> **type**: `"date"`

Defined in: [packages/algorithm-validator/src/types.ts:105](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L105)

***

### minDate?

> `optional` **minDate**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:107](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L107)

Minimum allowed date (ISO string)

***

### maxDate?

> `optional` **maxDate**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:109](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L109)

Maximum allowed date (ISO string)
