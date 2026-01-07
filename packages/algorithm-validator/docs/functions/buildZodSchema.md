[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / buildZodSchema

# Function: buildZodSchema()

> **buildZodSchema**(`definition`): `ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:105](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/validation.ts#L105)

Builds a Zod schema from an AlgorithmDefinition.

This is the core validation logic that converts an AlgorithmDefinition into a Zod schema
that can be used for runtime validation. Each input in the definition is converted
to its corresponding Zod validator with appropriate constraints.

## Parameters

### definition

[`AlgorithmDefinition`](../interfaces/AlgorithmDefinition.md)

The AlgorithmDefinition to convert

## Returns

`ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

A Zod object schema that can be used for validation

## Example

```typescript
const definition: AlgorithmDefinition = {
  // ... definition
}
const zodSchema = buildZodSchema(definition)
const result = zodSchema.safeParse(data)
```
