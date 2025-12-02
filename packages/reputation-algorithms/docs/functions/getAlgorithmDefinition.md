[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinition

# Function: getAlgorithmDefinition()

> **getAlgorithmDefinition**(`filters`): `string`

Defined in: [api/registry.ts:107](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/api/registry.ts#L107)

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

`string`

A JSON string representation of the algorithm definition object

## Throws

When the algorithm key or version is not found

## Example

```ts
const definition = getAlgorithmDefinition({ key: 'voting-engagement' })

const specific = getAlgorithmDefinition({
  key: 'voting-engagement',
  version: '1.0.0'
})
```
