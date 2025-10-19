**@reputo/database v0.0.0**

***

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

## Database Connection Setup

Before using the models, ensure you have a MongoDB connection established:

```ts
import mongoose from 'mongoose'

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/reputo')

// Or use environment variables
await mongoose.connect(process.env.MONGODB_URI!)
```

## Usage

### Models

The package provides two main models for managing algorithm presets and execution snapshots:

#### AlgorithmPreset Model

```ts
import { AlgorithmPresetModel } from '@reputo/database'

// Create a new algorithm preset
const preset = new AlgorithmPresetModel({
    spec: {
        key: 'voting_engagement',
        version: '1.0.0',
    },
    inputs: [
        { key: 'threshold', value: 0.5 },
        { key: 'weight', value: 1.2 },
    ],
    name: 'Voting Engagement Algorithm',
    description: 'Calculates engagement based on voting patterns',
})

await preset.save()

// Find presets by algorithm key
const presets = await AlgorithmPresetModel.find({
    'spec.key': 'voting_engagement',
})

// Find specific version
const specificPreset = await AlgorithmPresetModel.findOne({
    'spec.key': 'voting_engagement',
    'spec.version': '1.0.0',
})
```

#### Snapshot Model

```ts
import { SnapshotModel, SnapshotStatus } from '@reputo/database'

// Create a new snapshot
const snapshot = new SnapshotModel({
    status: SnapshotStatus.PENDING,
    algorithmPreset: preset._id,
    temporal: {
        workflowId: 'workflow-123',
        runId: 'run-456',
        taskQueue: 'reputation-queue',
    },
})

await snapshot.save()

// Update snapshot with results
await SnapshotModel.findByIdAndUpdate(snapshot._id, {
    status: SnapshotStatus.COMPLETED,
    outputs: { score: 0.85, confidence: 0.92 },
})

// Find snapshots by status
const pendingSnapshots = await SnapshotModel.find({
    status: SnapshotStatus.PENDING,
})
```

### Schemas

Access the underlying Mongoose schemas for custom operations:

```ts
import { AlgorithmPresetSchema, SnapshotSchema } from '@reputo/database'

// Use schemas for validation
const isValid = AlgorithmPresetSchema.validateSync(presetData)
```

### Interfaces

Use the TypeScript interfaces for type safety:

```ts
import type {
    AlgorithmPreset,
    AlgorithmPresetDoc,
    Snapshot,
    SnapshotDoc,
    SnapshotStatus,
} from '@reputo/database'

function processPreset(preset: AlgorithmPresetDoc): void {
    // Type-safe access to preset properties
    console.log(preset.spec.key, preset.inputs)
}

function updateSnapshotStatus(
    snapshot: SnapshotDoc,
    status: SnapshotStatus
): void {
    snapshot.status = status
    snapshot.save()
}
```

### Constants

Access predefined constants:

```ts
import { MODEL_NAMES, SnapshotStatus } from '@reputo/database'

// Use model names for dynamic operations
const modelName = MODEL_NAMES.ALGORITHM_PRESET

// Use status constants
const status = SnapshotStatus.COMPLETED
```

## API Reference

### Models

- **AlgorithmPresetModel**: Mongoose model for algorithm presets
- **SnapshotModel**: Mongoose model for execution snapshots

### Schemas

- **AlgorithmPresetSchema**: Mongoose schema for algorithm presets
- **SnapshotSchema**: Mongoose schema for execution snapshots

### Interfaces

- **AlgorithmPreset**: TypeScript interface for algorithm preset documents
- **AlgorithmPresetDoc**: Hydrated document type for algorithm presets
- **AlgorithmPresetModel**: Mongoose model interface for algorithm presets
- **Snapshot**: TypeScript interface for snapshot documents
- **SnapshotDoc**: Hydrated document type for snapshots
- **SnapshotModel**: Mongoose model interface for snapshots

### Constants

- **MODEL_NAMES**: Object containing model name constants
- **SnapshotStatus**: Enum for snapshot status values

## License

Released under the **GPL-3.0** license.

This project is open source and welcomes contributions from the community.
