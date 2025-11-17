[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:43](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/reputation-algorithms/src/api/registry.ts#L43)

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
