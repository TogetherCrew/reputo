[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPresetFrozen

# Interface: AlgorithmPresetFrozen

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:6](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L6)

Interface representing a frozen snapshot of an AlgorithmPreset.

This immutable copy mirrors the AlgorithmPreset shape and is embedded within a Snapshot document.

## Properties

### key

> **key**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:8](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L8)

Unique algorithm identifier (e.g., 'voting_engagement')

***

### version

> **version**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:10](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L10)

Algorithm version (e.g., '1.0.0')

***

### inputs

> **inputs**: `object`[]

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L12)

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

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:19](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L19)

Optional human-readable name for the preset (3-100 characters)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:21](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L21)

Optional description of the preset (10-500 characters)

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:23](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L23)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts:25](https://github.com/TogetherCrew/reputo/blob/5a0a43afb12601c8f7dec76d4c60ab590c463bc5/packages/database/src/shared/types/AlgorithmPresetFrozen.interface.ts#L25)

Document last update timestamp
