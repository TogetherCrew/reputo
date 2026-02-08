[**@reputo/reputation-algorithms v0.0.0**](../README.md)

***

[@reputo/reputation-algorithms](../globals.md) / AlgorithmDefinition

# Interface: AlgorithmDefinition

Defined in: [shared/types/algorithm.ts:153](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L153)

Complete algorithm definition structure.

## Properties

### key

> **key**: `string`

Defined in: [shared/types/algorithm.ts:155](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L155)

Unique identifier for the algorithm

***

### name

> **name**: `string`

Defined in: [shared/types/algorithm.ts:157](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L157)

Human-readable name of the algorithm

***

### category

> **category**: [`AlgorithmCategory`](../type-aliases/AlgorithmCategory.md)

Defined in: [shared/types/algorithm.ts:159](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L159)

Category classification for organizing algorithms

***

### summary

> **summary**: `string`

Defined in: [shared/types/algorithm.ts:161](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L161)

Short summary of the algorithm for card displays

***

### description

> **description**: `string`

Defined in: [shared/types/algorithm.ts:163](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L163)

Detailed description of what the algorithm does and how it works

***

### version

> **version**: `string`

Defined in: [shared/types/algorithm.ts:165](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L165)

Semantic version of the algorithm definition

***

### inputs

> **inputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [shared/types/algorithm.ts:167](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L167)

Array of input data specifications

***

### outputs

> **outputs**: [`IoItem`](../type-aliases/IoItem.md)[]

Defined in: [shared/types/algorithm.ts:169](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L169)

Array of output data specifications

***

### runtime

> **runtime**: [`AlgorithmRuntime`](../type-aliases/AlgorithmRuntime.md)

Defined in: [shared/types/algorithm.ts:171](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L171)

Runtime (language) used for execution routing

***

### dependencies?

> `optional` **dependencies**: [`AlgorithmDependency`](AlgorithmDependency.md)[]

Defined in: [shared/types/algorithm.ts:173](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/reputation-algorithms/src/shared/types/algorithm.ts#L173)

Optional array of external dependencies required by this algorithm
