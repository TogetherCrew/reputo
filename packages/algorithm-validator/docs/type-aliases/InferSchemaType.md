[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / InferSchemaType

# Type Alias: InferSchemaType

> **InferSchemaType** = `z.infer`\<`ReturnType`\<*typeof* [`buildZodSchema`](../functions/buildZodSchema.md)\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:195](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/algorithm-validator/src/validation.ts#L195)

Type inference helper for AlgorithmDefinition.

Infers the TypeScript type of the validated payload from an AlgorithmDefinition.
This allows you to get type-safe access to validated data.

## Example

```typescript
const definition: AlgorithmDefinition = {
  // ... definition
}
type ValidatedType = InferSchemaType<typeof definition>
// ValidatedType will be the inferred type from the definition
```
