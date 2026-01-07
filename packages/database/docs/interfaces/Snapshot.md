[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:22](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L22)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:24](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L24)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:26](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L26)

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

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:41](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L41)

Reference to the associated AlgorithmPreset

***

### algorithmPresetFrozen

> **algorithmPresetFrozen**: [`AlgorithmPresetFrozen`](AlgorithmPresetFrozen.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:43](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L43)

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: [`SnapshotOutputs`](SnapshotOutputs.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:45](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L45)

Algorithm execution outputs/results

***

### startedAt?

> `optional` **startedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:47](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L47)

Timestamp when execution started (status changed to 'running')

***

### completedAt?

> `optional` **completedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:49](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L49)

Timestamp when execution completed (status changed to 'completed' or 'failed')

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:51](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L51)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:53](https://github.com/TogetherCrew/reputo/blob/57dfec2effe2c3ced53491692acc5546475eb9d2/packages/database/src/shared/types/Snapshot.interface.ts#L53)

Document last update timestamp
