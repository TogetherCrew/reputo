[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ValidationResult

# Interface: ValidationResult

Defined in: [packages/algorithm-validator/src/types.ts:14](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/types.ts#L14)

Result of payload validation against an AlgorithmDefinition.

## Properties

### success

> **success**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:16](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/types.ts#L16)

Whether validation succeeded

***

### data?

> `optional` **data**: `unknown`

Defined in: [packages/algorithm-validator/src/types.ts:18](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/types.ts#L18)

Validated data (only present if success is true)

***

### errors?

> `optional` **errors**: `object`[]

Defined in: [packages/algorithm-validator/src/types.ts:20](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/types.ts#L20)

Array of validation errors (only present if success is false)

#### field

> **field**: `string`

Field path where the error occurred

#### message

> **message**: `string`

Human-readable error message

#### code?

> `optional` **code**: `string`

Zod error code (e.g., 'too_small', 'invalid_type')
