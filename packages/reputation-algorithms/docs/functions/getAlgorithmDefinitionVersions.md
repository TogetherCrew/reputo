[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionVersions

# Function: getAlgorithmDefinitionVersions()

> **getAlgorithmDefinitionVersions**(`key`): readonly `string`[]

Defined in: [api/registry.ts:64](https://github.com/TogetherCrew/reputo/blob/eeb748343323cd0cc935172e77e2112482891bd2/packages/reputation-algorithms/src/api/registry.ts#L64)

Retrieves all available versions for a specific algorithm definition.

## Parameters

### key

`string`

The algorithm key to get versions for

## Returns

readonly `string`[]

A readonly array of version strings available for the algorithm

## Throws

When the algorithm key is not found in the registry

## Example

```ts
const versions = getAlgorithmDefinitionVersions('my-algorithm')
console.log('Available versions:', versions)
// e.g. ['1.0.0', '1.1.0', '2.0.0']
```
