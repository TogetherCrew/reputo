[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [shared/types/algorithm.ts:198](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L198)

Complete algorithm definition structure.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:200](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L200)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [shared/types/algorithm.ts:202](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L202)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [shared/types/algorithm.ts:204](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L204)

Category classification for organizing algorithms

***

### summary

> **summary**: `string`

Defined in: [shared/types/algorithm.ts:206](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L206)

Short summary of the algorithm for card displays

***

### description

> **description**: `string`

Defined in: [shared/types/algorithm.ts:208](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L208)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [shared/types/algorithm.ts:210](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L210)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [shared/types/algorithm.ts:212](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L212)

Array of input data specifications

***

### outputs

> **outputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [shared/types/algorithm.ts:214](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L214)

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntime`](../type-aliases/AlgorithmRuntime.md)

Defined in: [shared/types/algorithm.ts:216](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L216)

Runtime (language) used for execution routing

***

### dependencies?

> `optional` **dependencies**: [`AlgorithmDependency`](AlgorithmDependency.md)[]

Defined in: [shared/types/algorithm.ts:218](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/reputation-algorithms/src/shared/types/algorithm.ts#L218)

Optional array of external dependencies required by this algorithm
