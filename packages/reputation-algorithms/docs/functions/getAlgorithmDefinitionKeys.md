[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:43](https://github.com/TogetherCrew/reputo/blob/0ed4dcc2bc5d7d34aede436d32405afb8fe52d0b/packages/reputation-algorithms/src/api/registry.ts#L43)

Retrieves all available algorithm definition keys from the registry.

## Returns

readonly `string`[]

A sorted array of algorithm keys that are available in the registry

## Example

```typescript
const keys = getAlgorithmDefinitionKeys();
console.log('Available algorithms:', keys);
// Output: ['voting-engagement', 'contrubition-score', ...]
```
