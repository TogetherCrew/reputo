import type { FilterQuery, HydratedDocument, Model } from 'mongoose';
import type { SnapshotStatus } from '../constants/index.js';
import type { PaginateOptions, PaginateResult } from '../plugins/index.js';
import type { AlgorithmPresetFrozen } from './AlgorithmPresetFrozen.interface.js';

export interface SnapshotOutputs {
  csv?: string;
}

/**
 * Interface defining the structure of a Snapshot document.
 *
 * Represents an execution snapshot tracking the status and results
 * of an algorithm execution with optional Temporal workflow integration.
 */
export interface Snapshot {
  /** Current execution status */
  status: SnapshotStatus;
  /** Optional Temporal workflow information */
  temporal?: {
    /** Temporal workflow ID */
    workflowId?: string;
    /** Temporal workflow run ID */
    runId?: string;
    /** Temporal task queue name */
    taskQueue?: string;
  };
  /** Frozen copy of the associated AlgorithmPreset at snapshot creation time */
  algorithmPresetFrozen: AlgorithmPresetFrozen;
  /** Algorithm execution outputs/results */
  outputs?: SnapshotOutputs;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Type representing a hydrated Snapshot document with Mongoose methods.
 */
export type SnapshotDoc = HydratedDocument<Snapshot>;

/**
 * Interface extending Mongoose Model with additional methods for Snapshot.
 */
export interface SnapshotModel extends Model<Snapshot> {
  /** Pagination method for querying snapshots */
  paginate: (filter: FilterQuery<Snapshot>, options: PaginateOptions) => Promise<PaginateResult<SnapshotDoc>>;
}
