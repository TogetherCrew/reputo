[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinition

# Function: getAlgorithmDefinition()

> **getAlgorithmDefinition**(`filters`): [`AlgorithmDefinition`](../interfaces/AlgorithmDefinition.md)

Defined in: [api/registry.ts:143](https://github.com/TogetherCrew/reputo/blob/0ed4dcc2bc5d7d34aede436d32405afb8fe52d0b/packages/reputation-algorithms/src/api/registry.ts#L143)

Retrieves a complete algorithm definition by key and version.

## Parameters

### filters

Object containing the algorithm key and optional version

#### key

`string`

The algorithm key to retrieve

#### version?

`string`

The version to retrieve (defaults to 'latest')

## Returns

[`AlgorithmDefinition`](../interfaces/AlgorithmDefinition.md)

A deep copy of the algorithm definition object

## Throws

When the algorithm key or version is not found

## Example

```typescript
const definition = getAlgorithmDefinition({ key: 'voting-engagement' });

const definition = getAlgorithmDefinition({
  key: 'voting-engagement',
  version: '1.0.0'
});

console.log('Algorithm definition:', definition);
// Output: { "key": "voting-engagement", "version": "1.0.0", ... }
```
