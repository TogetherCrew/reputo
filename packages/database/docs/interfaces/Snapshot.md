[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:11](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L11)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:13](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L13)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:15](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L15)

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

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:24](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L24)

Reference to the associated AlgorithmPreset

***

### outputs?

> `optional` **outputs**: `unknown`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:26](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L26)

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:28](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L28)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:30](https://github.com/TogetherCrew/reputo/blob/413a65312d2e71068be02885525ba8b64731b3a2/packages/database/src/interfaces/Snapshot.interface.ts#L30)

Document last update timestamp
