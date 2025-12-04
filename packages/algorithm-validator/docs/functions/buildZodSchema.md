[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / buildZodSchema

# Function: buildZodSchema()

> **buildZodSchema**(`definition`): `ZodObject`\<`Record`\<`string`, `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:106](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/algorithm-validator/src/validation.ts#L106)

Builds a Zod schema from an AlgorithmDefinition.

This is the core validation logic that converts an AlgorithmDefinition into a Zod schema
that can be used for runtime validation. Each input in the definition is converted
to its corresponding Zod validator with appropriate constraints.

## Parameters

### definition

`AlgorithmDefinition`

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
