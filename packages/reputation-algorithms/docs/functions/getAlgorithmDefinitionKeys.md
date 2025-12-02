[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:66](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/api/registry.ts#L66)

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
