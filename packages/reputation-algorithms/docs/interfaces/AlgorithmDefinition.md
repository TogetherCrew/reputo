[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [shared/types/algorithm.ts:95](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L95)

Complete algorithm definition structure.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:97](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L97)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [shared/types/algorithm.ts:99](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L99)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [shared/types/algorithm.ts:101](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L101)

Category classification for organizing algorithms

***

### description

> **description**: `string`

Defined in: [shared/types/algorithm.ts:103](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L103)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [shared/types/algorithm.ts:105](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L105)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: [shared/types/algorithm.ts:107](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L107)

Array of input data specifications

***

### outputs

> **outputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: [shared/types/algorithm.ts:109](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L109)

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntimeMetadata`](AlgorithmRuntimeMetadata.md)

Defined in: [shared/types/algorithm.ts:111](https://github.com/TogetherCrew/reputo/blob/b53a1fc775dec485fe8825232e01c2b312ae43cf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L111)

Runtime execution metadata for orchestration layers
