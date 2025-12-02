[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / SearchAlgorithmFilters

# Interface: SearchAlgorithmFilters

Defined in: [shared/types/algorithm.ts:117](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L117)

Filters for searching algorithm definitions by metadata.

## Properties

### key?

> `optional` **key**: `string`

Defined in: [shared/types/algorithm.ts:122](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L122)

Algorithm key to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### name?

> `optional` **name**: `string`

Defined in: [shared/types/algorithm.ts:128](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L128)

Human-readable algorithm name to search for.
Supports exact and partial (substring) matching, case-insensitive.

***

### category?

> `optional` **category**: `string`

Defined in: [shared/types/algorithm.ts:134](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L134)

Algorithm category to search for.
Supports exact and partial (substring) matching, case-insensitive.
