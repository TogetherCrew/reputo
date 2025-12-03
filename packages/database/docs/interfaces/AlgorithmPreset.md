[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPreset

# Interface: AlgorithmPreset

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:10](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L10)

Interface defining the structure of an AlgorithmPreset document.

Represents a configuration preset for an algorithm with specific
version and input parameters.

## Properties

### key

> **key**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L12)

Unique algorithm identifier (e.g., 'voting_engagement')

***

### version

> **version**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:14](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L14)

Algorithm version (e.g., '1.0.0')

***

### inputs

> **inputs**: `object`[]

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:16](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L16)

Array of input parameters for the algorithm

#### key

> **key**: `string`

Parameter key/name

#### value?

> `optional` **value**: `unknown`

Parameter value (can be any type)

***

### name?

> `optional` **name**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:23](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L23)

Optional human-readable name for the preset (3-100 characters)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:25](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L25)

Optional description of the preset (10-500 characters)

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:27](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L27)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/shared/types/AlgorithmPreset.interface.ts:29](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPreset.interface.ts#L29)

Document last update timestamp
