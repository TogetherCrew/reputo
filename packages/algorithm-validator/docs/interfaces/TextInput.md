[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / TextInput

# Interface: TextInput

Defined in: [packages/algorithm-validator/src/types.ts:73](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L73)

Text input with length and pattern validation.

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

> **type**: `"text"`

Defined in: [packages/algorithm-validator/src/types.ts:74](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L74)

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:76](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L76)

Minimum character length

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:78](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L78)

Maximum character length

***

### pattern?

> `optional` **pattern**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:80](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L80)

Regular expression pattern the text must match
