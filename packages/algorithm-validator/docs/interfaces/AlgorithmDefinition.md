[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:167](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L167)

Complete algorithm definition structure.

This interface defines the shape of an algorithm definition object,
which describes inputs, outputs, and runtime configuration for a
reputation algorithm.

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:169](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L169)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:171](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L171)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:173](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L173)

Category classification for organizing algorithms

***

### description

> **description**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:175](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L175)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:177](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L177)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:179](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L179)

Array of input data specifications

***

### outputs

> **outputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:181](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L181)

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntime`](../type-aliases/AlgorithmRuntime.md)

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:183](https://github.com/reputo-org/reputo/blob/ca839466775a08b98a6b539646013f806761756b/packages/algorithm-validator/src/types/algorithm.ts#L183)

Runtime (language) used for execution routing
