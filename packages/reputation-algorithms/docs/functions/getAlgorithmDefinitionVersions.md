[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionVersions

# Function: getAlgorithmDefinitionVersions()

> **getAlgorithmDefinitionVersions**(`key`): readonly `string`[]

Defined in: [api/registry.ts:84](https://github.com/TogetherCrew/reputo/blob/9c691b9aaedc2d500add44cc3106836fbe68fa93/packages/reputation-algorithms/src/api/registry.ts#L84)

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
