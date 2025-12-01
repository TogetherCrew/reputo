import { model } from 'mongoose';
import { SnapshotSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import { type Snapshot, type SnapshotModel } from '../shared/types/index.js';

/**
 * Mongoose model for Snapshot documents.
 */
const SnapshotModel: SnapshotModel = model<Snapshot, SnapshotModel>(MODEL_NAMES.SNAPSHOT, SnapshotSchema);

export default SnapshotModel;
