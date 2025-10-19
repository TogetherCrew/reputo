[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / AlgorithmPreset

# Interface: AlgorithmPreset

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:9](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L9)

Interface defining the structure of an AlgorithmPreset document.

Represents a configuration preset for an algorithm with specific
version and input parameters.

## Properties

### spec

> **spec**: `object`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:11](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L11)

Algorithm specification containing key and version

#### key

> **key**: `string`

Unique algorithm identifier (e.g., 'voting_engagement')

#### version

> **version**: `string`

Algorithm version (e.g., '1.0.0')

***

### inputs

> **inputs**: `object`[]

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:18](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L18)

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

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:25](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L25)

Optional human-readable name for the preset

***

### description?

> `optional` **description**: `string`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:27](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L27)

Optional description of the preset

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:29](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L29)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/interfaces/AlgorithmPreset.interface.ts:31](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/AlgorithmPreset.interface.ts#L31)

Document last update timestamp
