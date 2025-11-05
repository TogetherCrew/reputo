**@reputo/database v0.0.0**

---

# @reputo/database

Mongoose-based database layer for the Reputo ecosystem. Provides type-safe models, schemas, and interfaces for managing algorithm presets and snapshots with comprehensive TypeScript support.

## Features

- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Mongoose integration**: Built on Mongoose ODM for MongoDB
- **Schema validation**: JSON Schema validation for data integrity
- **Temporal workflow support**: Built-in support for Temporal workflow tracking
- **Comprehensive models**: AlgorithmPreset and Snapshot models with full CRUD operations

## Installation

```bash
pnpm add @reputo/database
```

## Usage

See the full API reference in [docs](_media/globals.md).

### Models

The package provides two main models for managing algorithm presets and execution snapshots:

#### AlgorithmPreset Model

```ts
import { AlgorithmPresetModel } from '@reputo/database'

// Create a new algorithm preset
const preset = new AlgorithmPresetModel({
    key: 'voting_engagement',
    version: '1.0.0',
    inputs: [
        { key: 'threshold', value: 0.5 },
        { key: 'weight', value: 1.2 },
    ],
    name: 'Voting Engagement Algorithm',
    description: 'Calculates engagement based on voting patterns',
})

await preset.save()

// Find presets by algorithm key
const presets = await AlgorithmPresetModel.find({ key: 'voting_engagement' })

// Find specific version
const specificPreset = await AlgorithmPresetModel.findOne({
    key: 'voting_engagement',
    version: '1.0.0',
})
```

#### Snapshot Model

```ts
import { SnapshotModel } from '@reputo/database'

// Create a new snapshot with frozen preset
const snapshot = new SnapshotModel({
    status: 'queued',
    algorithmPresetFrozen: {
        key: 'voting_engagement',
        version: '1.0.0',
        inputs: [
            { key: 'threshold', value: 0.5 },
            { key: 'weight', value: 1.2 },
        ],
        name: 'Voting Engagement Algorithm',
        description: 'Calculates engagement based on voting patterns',
        // Note: When created via the API, the frozen preset will include
        // the original preset's createdAt/updatedAt timestamps.
    },
    temporal: {
        workflowId: 'workflow-123',
        runId: 'run-456',
        taskQueue: 'reputation-queue',
    },
})

await snapshot.save()

// Update snapshot with results
await SnapshotModel.findByIdAndUpdate(snapshot._id, {
    status: 'completed',
    outputs: { csv: 'key', json: 'key' },
})

// Find snapshots by status
const queuedSnapshots = await SnapshotModel.find({ status: 'queued' })

// Query by frozen preset fields
const snapshotsForAlgorithm = await SnapshotModel.find({
    'algorithmPresetFrozen.key': 'voting_engagement',
    'algorithmPresetFrozen.version': '1.0.0',
})
```

> The `algorithmPresetFrozen` embedded document mirrors the `AlgorithmPreset` schema and includes timestamps. It represents the point-in-time configuration at snapshot creation.

## License

Released under the **GPL-3.0** license. See [LICENSE](_media/LICENSE) file for details.

This project is open source and welcomes contributions from the community.
