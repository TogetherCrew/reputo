[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:12](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L12)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:14](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L14)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:16](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L16)

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

### algorithmPresetFrozen

> **algorithmPresetFrozen**: [`AlgorithmPresetFrozen`](AlgorithmPresetFrozen.md)

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:25](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L25)

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: `unknown`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:27](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L27)

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:29](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L29)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:31](https://github.com/TogetherCrew/reputo/blob/d73f0d2c46f5cbd7b3793a8af7862e85fea62117/packages/database/src/interfaces/Snapshot.interface.ts#L31)

Document last update timestamp
