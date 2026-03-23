[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:211](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L211)

Complete algorithm definition structure.

This interface defines the shape of an algorithm definition object,
which describes inputs, outputs, and runtime configuration for a
reputation algorithm.

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:213](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L213)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:215](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L215)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:217](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L217)

Category classification for organizing algorithms

***

### description

> **description**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:219](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L219)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:221](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L221)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:223](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L223)

Array of input data specifications

***

### outputs

> **outputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:225](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L225)

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntime`](../type-aliases/AlgorithmRuntime.md)

Defined in: [packages/algorithm-validator/src/types/algorithm.ts:227](https://github.com/reputo-org/reputo/blob/9a4ebf229b761f91ab7737ab01f22c15054631c0/packages/algorithm-validator/src/types/algorithm.ts#L227)

Runtime (language) used for execution routing
