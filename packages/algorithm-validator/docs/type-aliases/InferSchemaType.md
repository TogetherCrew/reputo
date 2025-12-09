[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / InferSchemaType

# Type Alias: InferSchemaType

> **InferSchemaType** = `z.infer`\<`ReturnType`\<*typeof* [`buildZodSchema`](../functions/buildZodSchema.md)\>\>

Defined in: [packages/algorithm-validator/src/validation.ts:247](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/validation.ts#L247)

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
