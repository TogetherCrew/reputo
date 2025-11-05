[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:43](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/api/registry.ts#L43)

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
