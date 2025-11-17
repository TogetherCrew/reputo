[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:16](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L16)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:18](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L18)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:20](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L20)

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

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:29](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L29)

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: [`SnapshotOutputs`](SnapshotOutputs.md)

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:31](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L31)

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:33](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L33)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/interfaces/Snapshot.interface.ts:35](https://github.com/TogetherCrew/reputo/blob/668913f3bddad795ee168fc5c009e413c85374c5/packages/database/src/interfaces/Snapshot.interface.ts#L35)

Document last update timestamp
