[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / validateCreateAlgorithmPreset

# Function: validateCreateAlgorithmPreset()

> **validateCreateAlgorithmPreset**(`data`): `ZodSafeParseResult`\<\{ `key`: `string`; `version`: `string`; `inputs`: `object`[]; `name?`: `string`; `description?`: `string`; \}\>

Defined in: [packages/algorithm-validator/src/schemas/algorithm-preset.ts:89](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/algorithm-validator/src/schemas/algorithm-preset.ts#L89)

Validates algorithm preset creation payload using Zod schema.

This is a convenience function that wraps the Zod schema's safeParse method,
providing a consistent validation interface for algorithm preset creation.

## Parameters

### data

`unknown`

The data to validate against the algorithm preset schema

## Returns

`ZodSafeParseResult`\<\{ `key`: `string`; `version`: `string`; `inputs`: `object`[]; `name?`: `string`; `description?`: `string`; \}\>

Zod's SafeParseReturnType containing either the validated data or error details

## Example

```typescript
const result = validateCreateAlgorithmPreset({
  key: 'voting_engagement',
  version: '1.0.0',
  inputs: [{ key: 'threshold', value: 0.5 }],
  name: 'Voting Engagement',
  description: 'Calculates engagement based on voting patterns'
})

if (result.success) {
  const preset: CreateAlgorithmPresetInput = result.data
  // Use validated preset data
} else {
  console.error('Validation errors:', result.error)
}
```
