[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / validatePayload

# Function: validatePayload()

> **validatePayload**(`schema`, `payload`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [packages/algorithm-validator/src/validation.ts:42](https://github.com/TogetherCrew/reputo/blob/7ce1d253271f56ea8d742827bb41a3600a765412/packages/algorithm-validator/src/validation.ts#L42)

Validates data against a ReputoSchema definition.

This function runs identically on both client and server, ensuring consistent
validation across the entire application. It builds a Zod schema from the
ReputoSchema and validates the payload against it.

## Parameters

### schema

[`ReputoSchema`](../interfaces/ReputoSchema.md)

The ReputoSchema definition containing input/output specifications

### payload

`unknown`

The data to validate against the schema

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

A ValidationResult object containing either validated data or error details

## Example

```typescript
const schema: ReputoSchema = {
  key: 'voting_engagement',
  name: 'Voting Engagement',
  category: 'engagement',
  description: 'Calculates engagement',
  version: '1.0.0',
  inputs: [
    { key: 'threshold', label: 'Threshold', type: 'number', min: 0, max: 1, required: true }
  ],
  outputs: []
}

const result = validatePayload(schema, { threshold: 0.5 })
if (result.success) {
  console.log('Valid:', result.data)
} else {
  console.error('Errors:', result.errors)
}
```
