[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:10](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L10)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L12)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:14](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L14)

Optional Temporal workflow information

#### workflowId?

> `optional` **workflowId**: `string`

Temporal workflow ID

#### runId?

> `optional` **runId**: `string`

Temporal workflow run ID

#### taskQueue?

> `optional` **taskQueue**: `string`

Temporal task queue name

***

### algorithmPreset

> **algorithmPreset**: `ObjectId`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:23](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L23)

Reference to the associated AlgorithmPreset

***

### outputs?

> `optional` **outputs**: `unknown`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:25](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L25)

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:27](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L27)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:29](https://github.com/TogetherCrew/reputo/blob/2db3ca681973f3b7304a52cef9c0cd9457c2c540/packages/database/src/interfaces/Snapshot.interface.ts#L29)

Document last update timestamp
