[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [shared/types/algorithm.ts:85](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L85)

Complete algorithm definition structure.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:87](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L87)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [shared/types/algorithm.ts:89](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L89)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [shared/types/algorithm.ts:91](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L91)

Category classification for organizing algorithms

***

### description

> **description**: `string`

Defined in: [shared/types/algorithm.ts:93](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L93)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [shared/types/algorithm.ts:95](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L95)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: [shared/types/algorithm.ts:97](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L97)

Array of input data specifications

***

### outputs

> **outputs**: [`CsvIoItem`](CsvIoItem.md)[]

Defined in: [shared/types/algorithm.ts:99](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/reputation-algorithms/src/shared/types/algorithm.ts#L99)

Array of output data specifications
