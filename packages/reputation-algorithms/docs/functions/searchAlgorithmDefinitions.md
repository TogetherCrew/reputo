[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / searchAlgorithmDefinitions

# Function: searchAlgorithmDefinitions()

> **searchAlgorithmDefinitions**(`filters`): `string`[]

Defined in: api/registry.ts:148

Searches algorithm definitions by metadata using flexible filters.

Matching rules:
- OR logic across fields: an algorithm matches if it satisfies ANY provided filter
- Within each field, matching is case-insensitive and supports:
  - Exact match (e.g. 'voting_power' === 'voting_power')
  - Partial/substring match (e.g. 'engagement' matches 'Engagement Score')

Version handling:
- Only the latest version of each algorithm key is considered and returned

## Parameters

### filters

[`SearchAlgorithmFilters`](../interfaces/SearchAlgorithmFilters.md) = `{}`

Optional filters to apply when searching

## Returns

`string`[]

Array of JSON string representations of matching algorithm definitions

## Example

```ts
// Search by key (exact or partial)
const byKey = searchAlgorithmDefinitions({ key: 'voting' })

// Search by name
const byName = searchAlgorithmDefinitions({ name: 'Engagement Score' })

// Search by category
const byCategory = searchAlgorithmDefinitions({ category: 'engagement' })

// Combined filters (OR logic)
const mixed = searchAlgorithmDefinitions({ key: 'voting', category: 'engagement' })
```
