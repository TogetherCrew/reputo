[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / BaseInput

# Interface: BaseInput

Defined in: [packages/algorithm-validator/src/types.ts:59](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L59)

Base interface for all input types.

All input types extend this interface with type-specific properties.

## Extended by

- [`BooleanInput`](BooleanInput.md)
- [`CSVInput`](CSVInput.md)
- [`DateInput`](DateInput.md)
- [`EnumInput`](EnumInput.md)
- [`NumberInput`](NumberInput.md)
- [`SliderInput`](SliderInput.md)
- [`TextInput`](TextInput.md)

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:61](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L61)

Unique key identifier for the input

***

### label

> **label**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:63](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L63)

Human-readable label for the input

***

### description?

> `optional` **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:65](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L65)

Optional description of the input

***

### required?

> `optional` **required**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:67](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L67)

Whether the input is required (default: true)
