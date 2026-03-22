[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / SearchAlgorithmFilters

# Interface: SearchAlgorithmFilters

Defined in: [shared/types/algorithm.ts:224](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L224)

Filters for searching algorithm definitions by metadata.

## Properties

### key?

> `optional` **key**: `string`

Defined in: [shared/types/algorithm.ts:229](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L229)

Algorithm key to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### name?

> `optional` **name**: `string`

Defined in: [shared/types/algorithm.ts:235](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L235)

Human-readable algorithm name to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### category?

> `optional` **category**: `string`

Defined in: [shared/types/algorithm.ts:241](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L241)

Algorithm category to search for.
Supports exact and partial (substring) matching, case-insensitive.
