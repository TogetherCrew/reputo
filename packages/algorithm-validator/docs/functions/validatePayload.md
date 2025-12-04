[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / validatePayload

# Function: validatePayload()

> **validatePayload**(`definition`, `payload`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [packages/algorithm-validator/src/validation.ts:55](https://github.com/TogetherCrew/reputo/blob/65751b698abd6e55f89885c11d644b5db7b22f59/packages/algorithm-validator/src/validation.ts#L55)

Validates data against an AlgorithmDefinition.

This function runs identically on both client and server, ensuring consistent
validation across the entire application. It builds a Zod schema from the
AlgorithmDefinition and validates the payload against it.

## Parameters

### definition

`AlgorithmDefinition`

The AlgorithmDefinition containing input/output specifications

### payload

`unknown`

The data to validate against the definition

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

A ValidationResult object containing either validated data or error details

## Example

```typescript
const definition: AlgorithmDefinition = {
  key: 'voting_engagement',
  name: 'Voting Engagement',
  category: 'Engagement',
  description: 'Calculates engagement',
  version: '1.0.0',
  inputs: [
    {
      key: 'votes',
      label: 'Votes CSV',
      type: 'csv',
      csv: {
        hasHeader: true,
        delimiter: ',',
        columns: [
          { key: 'user_id', type: 'string', required: true }
        ]
      }
    }
  ],
  outputs: [],
  runtime: { taskQueue: 'default', activity: 'calculateVotingEngagement' }
}

const result = validatePayload(definition, { votes: 'storage-key-123' })
if (result.success) {
  console.log('Valid:', result.data)
} else {
  console.error('Errors:', result.errors)
}
```
