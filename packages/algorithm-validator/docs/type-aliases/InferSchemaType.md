[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / InferSchemaType

# Type Alias: InferSchemaType

> **InferSchemaType** = `z.infer`\<`ReturnType`\<*typeof* [`buildZodSchema`](../functions/buildZodSchema.md)\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:247](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/validation.ts#L247)

Type inference helper for ReputoSchema.

Infers the TypeScript type of the validated payload from a ReputoSchema definition.
This allows you to get type-safe access to validated data.

## Example

```typescript
const schema: ReputoSchema = {
  // ... schema definition
}
type ValidatedType = InferSchemaType<typeof schema>
// ValidatedType will be the inferred type from the schema
```
