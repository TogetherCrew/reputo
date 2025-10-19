[**@reputo/database v0.0.0**](../README.md)

***

[@reputo/database](../globals.md) / Snapshot

# Interface: Snapshot

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:10

Interface defining the structure of a Snapshot document.

Represents an execution snapshot tracking the status and results
of an algorithm execution with optional Temporal workflow integration.

## Properties

### status

> **status**: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"cancelled"`

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:12

Current execution status

***

### temporal?

> `optional` **temporal**: `object`

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:14

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

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:23

Reference to the associated AlgorithmPreset

***

### outputs?

> `optional` **outputs**: `unknown`

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:25

Algorithm execution outputs/results

***

### createdAt?

> `optional` **createdAt**: `Date`

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:27

Document creation timestamp

***

### updatedAt?

> `optional` **updatedAt**: `Date`

Defined in: packages/database/src/interfaces/Snapshot.interface.ts:29

Document last update timestamp
