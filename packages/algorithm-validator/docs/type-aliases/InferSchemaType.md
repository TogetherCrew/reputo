[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / InferSchemaType

# Type Alias: InferSchemaType

> **InferSchemaType** = `z.infer`\<`ReturnType`\<*typeof* [`buildZodSchema`](../functions/buildZodSchema.md)\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:289](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/algorithm-validator/src/validation.ts#L289)

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
