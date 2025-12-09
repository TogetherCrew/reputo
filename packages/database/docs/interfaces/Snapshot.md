[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:22](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L22)

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:24](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L24)

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:26](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L26)

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

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:35](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L35)

Reference to the associated AlgorithmPreset

***

### algorithmPresetFrozen

> **algorithmPresetFrozen**: [`AlgorithmPresetFrozen`](AlgorithmPresetFrozen.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:37](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L37)

Frozen copy of the associated AlgorithmPreset at snapshot creation time

***

### outputs?

> `optional` **outputs**: [`SnapshotOutputs`](SnapshotOutputs.md)

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:39](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L39)

Algorithm execution outputs/results

***

### startedAt?

> `optional` **startedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:41](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L41)

Timestamp when execution started (status changed to 'running')

***

### completedAt?

> `optional` **completedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:43](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L43)

Timestamp when execution completed (status changed to 'completed' or 'failed')

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:45](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L45)

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: [packages/database/src/shared/types/Snapshot.interface.ts:47](https://github.com/TogetherCrew/reputo/blob/af19bb44929980b2af51d344df06251cde19d556/packages/database/src/shared/types/Snapshot.interface.ts#L47)

Document last update timestamp
