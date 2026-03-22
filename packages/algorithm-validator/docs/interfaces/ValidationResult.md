[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ValidationResult

# Interface: ValidationResult

Defined in: [packages/algorithm-validator/src/types/index.ts:20](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/index.ts#L20)

Result of payload validation against an AlgorithmDefinition.

## Properties

### success

> **success**: `boolean`

Defined in: [packages/algorithm-validator/src/types/index.ts:22](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/index.ts#L22)

Whether validation succeeded

***

### data?

> `optional` **data**: `unknown`

Defined in: [packages/algorithm-validator/src/types/index.ts:24](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/index.ts#L24)

Validated data (only present if success is true)

***

### errors?

> `optional` **errors**: `object`[]

Defined in: [packages/algorithm-validator/src/types/index.ts:26](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/index.ts#L26)

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
