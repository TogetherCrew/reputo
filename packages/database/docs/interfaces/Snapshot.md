[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:34](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L34)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:36](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L36)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:38](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L38)

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

#### algorithmTaskQueue?

> `optional` **algorithmTaskQueue**: `string`

Algorithm task queue used for algorithm activity execution.

Note: This is intentionally separate from `taskQueue`, which stores the orchestrator workflow task queue.

***

### algorithmPreset

> **algorithmPreset**: `string` \| `ObjectId`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:53](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L53)

Reference to the associated AlgorithmPreset

***

### algorithmPresetFrozen

> **algorithmPresetFrozen**: [`AlgorithmPresetFrozen`](AlgorithmPresetFrozen.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:55](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L55)

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: [`SnapshotOutputs`](SnapshotOutputs.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:57](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L57)

Algorithm execution outputs/results

***

### error?

> `optional` **error**: [`SnapshotError`](SnapshotError.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:59](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L59)

Error information when execution fails

***

### startedAt?

> `optional` **startedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:61](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L61)

Timestamp when execution started (status changed to 'running')

***

### completedAt?

> `optional` **completedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:63](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L63)

Timestamp when execution completed (status changed to 'completed' or 'failed')

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:65](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L65)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:67](https://github.com/TogetherCrew/reputo/blob/d3645de26613ef1e4f98fe4ffe438d901c4e46bf/packages/database/src/shared/types/Snapshot.interface.ts#L67)

Document last update timestamp
