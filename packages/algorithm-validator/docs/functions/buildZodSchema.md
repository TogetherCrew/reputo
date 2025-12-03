[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / buildZodSchema

# Function: buildZodSchema()

> **buildZodSchema**(`reputoSchema`): `ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:93](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/validation.ts#L93)

Builds a Zod schema from a ReputoSchema definition.

This is the core validation logic that converts a ReputoSchema into a Zod schema
that can be used for runtime validation. Each input in the schema is converted
to its corresponding Zod validator with appropriate constraints.

## Parameters

### reputoSchema

[`ReputoSchema`](../interfaces/ReputoSchema.md)

The ReputoSchema definition to convert

## Returns

`ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

A Zod object schema that can be used for validation

## Example

```typescript
const schema: ReputoSchema = {
  // ... schema definition
}
const zodSchema = buildZodSchema(schema)
const result = zodSchema.safeParse(data)
```
