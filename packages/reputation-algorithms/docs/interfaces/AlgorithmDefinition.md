[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: shared/types/algorithm.ts:95

Complete algorithm definition structure.

## Properties

### key

> **key**: `string`

Defined in: shared/types/algorithm.ts:97

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: shared/types/algorithm.ts:99

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: shared/types/algorithm.ts:101

Category classification for organizing algorithms

***

### description

> **description**: `string`

Defined in: shared/types/algorithm.ts:103

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: shared/types/algorithm.ts:105

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: shared/types/algorithm.ts:107

Array of input data specifications

***

### outputs

> **outputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: shared/types/algorithm.ts:109

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntimeMetadata`](AlgorithmRuntimeMetadata.md)

Defined in: shared/types/algorithm.ts:111

Runtime execution metadata for orchestration layers
