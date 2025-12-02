[**@reputo/algorithm-validator v0.0.0**](../README.md)

***

[@reputo/algorithm-validator](../globals.md) / ReputoSchema

# Interface: ReputoSchema

Defined in: [packages/algorithm-validator/src/types.ts:170](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L170)

Complete schema definition for a Reputo algorithm.

This schema defines the structure, inputs, and outputs for an algorithm,
and is used to generate validation schemas and type definitions.

## Properties

### key

> **key**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:172](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L172)

Unique key identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:174](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L174)

Human-readable name of the algorithm

***

### category

> **category**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:176](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L176)

Category the algorithm belongs to

***

### description

> **description**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:178](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L178)

Description of what the algorithm does

***

### version

> **version**: `string`

Defined in: [packages/algorithm-validator/src/types.ts:180](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L180)

Version of the algorithm schema

***

### inputs

> **inputs**: [`Input`](../type-aliases/Input.md)[]

Defined in: [packages/algorithm-validator/src/types.ts:182](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L182)

Array of input definitions

***

### outputs

> **outputs**: [`Output`](Output.md)[]

Defined in: [packages/algorithm-validator/src/types.ts:184](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/algorithm-validator/src/types.ts#L184)

Array of output definitions
