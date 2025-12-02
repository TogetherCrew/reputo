[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ValidationResult

# Interface: ValidationResult

Defined in: [packages/algorithm-validator/src/types.ts:190](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L190)

Result of payload validation against a ReputoSchema.

## Properties

### success

> **success**: `boolean`

Defined in: [packages/algorithm-validator/src/types.ts:192](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L192)

Whether validation succeeded

***

### data?

> `optional` **data**: `unknown`

Defined in: [packages/algorithm-validator/src/types.ts:194](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L194)

Validated data (only present if success is true)

***

### errors?

> `optional` **errors**: `object`[]

Defined in: [packages/algorithm-validator/src/types.ts:196](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/algorithm-validator/src/types.ts#L196)

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
