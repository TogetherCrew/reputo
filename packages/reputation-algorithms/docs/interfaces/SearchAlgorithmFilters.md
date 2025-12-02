[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / SearchAlgorithmFilters

# Interface: SearchAlgorithmFilters

Defined in: [shared/types/algorithm.ts:117](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/shared/types/algorithm.ts#L117)

Filters for searching algorithm definitions by metadata.

## Properties

### key?

> `optional` **key**: `string`

Defined in: [shared/types/algorithm.ts:122](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/shared/types/algorithm.ts#L122)

Algorithm key to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### name?

> `optional` **name**: `string`

Defined in: [shared/types/algorithm.ts:128](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/shared/types/algorithm.ts#L128)

Human-readable algorithm name to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### category?

> `optional` **category**: `string`

Defined in: [shared/types/algorithm.ts:134](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/reputation-algorithms/src/shared/types/algorithm.ts#L134)

Algorithm category to search for.
Supports exact and partial (substring) matching, case-insensitive.
