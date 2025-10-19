[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionKeys

# Function: getAlgorithmDefinitionKeys()

> **getAlgorithmDefinitionKeys**(): readonly `string`[]

Defined in: [api/registry.ts:46](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/api/registry.ts#L46)

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
