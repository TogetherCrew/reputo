[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ValidationResult

# Interface: ValidationResult

Defined in: [packages/algorithm-validator/src/types/index.ts:18](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/types/index.ts#L18)

Result of payload validation against an AlgorithmDefinition.

## Properties

### success

> **success**: `boolean`

Defined in: [packages/algorithm-validator/src/types/index.ts:20](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/types/index.ts#L20)

Whether validation succeeded

***

### data?

> `optional` **data**: `unknown`

Defined in: [packages/algorithm-validator/src/types/index.ts:22](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/types/index.ts#L22)

Validated data (only present if success is true)

***

### errors?

> `optional` **errors**: `object`[]

Defined in: [packages/algorithm-validator/src/types/index.ts:24](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/types/index.ts#L24)

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
