[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / CSVInput

# Interface: CSVInput

Defined in: [packages/algorithm-validator/src/types.ts:124](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L124)

CSV file input with column validation.

## Extends

- [`BaseInput`](BaseInput.md)

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:61](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L61)

Unique key identifier for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`key`](BaseInput.md#key)

***

### label

> **label**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:63](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L63)

Human-readable label for the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`label`](BaseInput.md#label)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:65](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L65)

Optional description of the input

#### Inherited from

[`BaseInput`](BaseInput.md).[`description`](BaseInput.md#description)

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:67](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L67)

Whether the input is required (default: true)

#### Inherited from

[`BaseInput`](BaseInput.md).[`required`](BaseInput.md#required)

***

### type

> **type**: `"csv"`

Defined in: [packages/algorithm-validator/src/types.ts:125](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L125)

***

### csv

> **csv**: [`CSVConfig`](CSVConfig.md)

Defined in: [packages/algorithm-validator/src/types.ts:127](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L127)

CSV validation configuration
