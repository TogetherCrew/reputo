import { model } from 'mongoose';
import { MODEL_NAMES } from '../constants/index.js';
import { type Snapshot, type SnapshotModel } from '../interfaces/index.js';
import { SnapshotSchema } from '../schemas/index.js';

/**
 * Mongoose model for Snapshot documents.
 */
const SnapshotModel: SnapshotModel = model<Snapshot, SnapshotModel>(MODEL_NAMES.SNAPSHOT, SnapshotSchema);

export default SnapshotModel;
