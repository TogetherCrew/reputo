import { model } from 'mongoose';
import { SnapshotSchema } from '../schemas/index.js';
import { MODEL_NAMES } from '../shared/constants/index.js';
import type { Snapshot, SnapshotModel } from '../shared/types/index.js';

/**
 * Mongoose model for Snapshot documents.
 */
export default model<Snapshot, SnapshotModel>(MODEL_NAMES.SNAPSHOT, SnapshotSchema);
