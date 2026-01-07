[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / InferSchemaType

# Type Alias: InferSchemaType

> **InferSchemaType** = `z.infer`\<`ReturnType`\<*typeof* [`buildZodSchema`](../functions/buildZodSchema.md)\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:281](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/algorithm-validator/src/validation.ts#L281)

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
