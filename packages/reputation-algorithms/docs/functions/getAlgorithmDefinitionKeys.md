[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:43](https://github.com/TogetherCrew/reputo/blob/f32aed14599aa4d8441b75f566584e7d9454f5b4/packages/reputation-algorithms/src/api/registry.ts#L43)

Retrieves all available algorithm definition keys from the registry.

## Returns

readonly `string`[]

A sorted array of algorithm keys available in the registry

## Example

```ts
const keys = getAlgorithmDefinitionKeys()
console.log('Available algorithms:', keys)
// e.g. ['voting-engagement', 'contribution-score', ...]
```
