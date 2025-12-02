[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:22

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:24

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:26

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

> **algorithmPreset**: `string` \| `ObjectId`

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:35

Reference to the associated AlgorithmPreset

***

### algorithmPresetFrozen

> **algorithmPresetFrozen**: [`AlgorithmPresetFrozen`](AlgorithmPresetFrozen.md)

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:37

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: [`SnapshotOutputs`](SnapshotOutputs.md)

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:39

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:41

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: packages/database/src/shared/types/Snapshot.interface.ts:43

Document last update timestamp
