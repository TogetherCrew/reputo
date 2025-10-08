[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinitionLatestVersion

# Function: getAlgorithmDefinitionLatestVersion()

> **getAlgorithmDefinitionLatestVersion**(`key`): `string`

Defined in: [api/registry.ts:79](https://github.com/TogetherCrew/reputo/blob/0ed4dcc2bc5d7d34aede436d32405afb8fe52d0b/packages/reputation-algorithms/src/api/registry.ts#L79)

Retrieves the latest version for a specific algorithm definition.

## Parameters

### key

`string`

The algorithm key to get the latest version for

## Returns

`string`

The latest version string for the algorithm

## Throws

When the algorithm key is not found in the registry

## Example

```typescript
const latestVersion = getAlgorithmDefinitionLatestVersion('voting-engagement');
console.log('Latest version:', latestVersion);
// Output: '2.0.0'
```
