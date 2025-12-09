[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / SliderInput

# Interface: SliderInput

Defined in: [packages/algorithm-validator/src/types.ts:133](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L133)

Slider input for numeric ranges (typically used in UI components).

## Extends

- [`BaseInput`](BaseInput.md)

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:61](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L61)

Unique key identifier for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`key`](BaseInput.md#key)

***

### label

> **label**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:63](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L63)

Human-readable label for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`label`](BaseInput.md#label)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:65](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L65)

Optional description of the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`description`](BaseInput.md#description)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:67](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L67)

Whether the input is required (default: true)

#### Inherited from

[`BaseInput`](BaseInput.md).[`required`](BaseInput.md#required)

***

### type

> **type**: `"slider"`

Defined in: [packages/algorithm-validator/src/types.ts:134](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L134)

***

### min

> **min**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:136](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L136)

Minimum value

***

### max

> **max**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:138](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L138)

Maximum value

***

### step?

> `optional` **step**: `number`

Defined in: [packages/algorithm-validator/src/types.ts:140](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/types.ts#L140)

Step increment (optional)
