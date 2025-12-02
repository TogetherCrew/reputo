[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / getAlgorithmDefinition

# Function: getAlgorithmDefinition()

> **getAlgorithmDefinition**(`filters`): `string`

Defined in: [api/registry.ts:107](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/api/registry.ts#L107)

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
