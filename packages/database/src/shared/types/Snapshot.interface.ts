import type { FilterQuery, HydratedDocument, Model, Types } from 'mongoose';
import type { SnapshotStatus } from '../constants/index.js';
import type { PaginateOptions, PaginateResult } from '../plugins/index.js';
import type { AlgorithmPresetFrozen } from './AlgorithmPresetFrozen.interface.js';

/**
 * Algorithm execution outputs/results.
 *
 * Keys are algorithm-specific (e.g., 'voting_engagement', 'csv').
 * Values are typically file paths or storage location references.
 */
export interface SnapshotOutputs {
  [key: string]: string | undefined;
}

/**
 * Error information captured when a snapshot execution fails.
 */
export interface SnapshotError {
  /** Error message describing what went wrong */
  message: string;
  /** Timestamp when the error occurred */
  timestamp?: string;
  /** Additional error context */
  [key: string]: unknown;
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
    /**
     * Algorithm task queue used for algorithm activity execution.
     *
     * Note: This is intentionally separate from `taskQueue`, which stores the orchestrator workflow task queue.
     */
    algorithmTaskQueue?: string;
  };
  /** Reference to the associated AlgorithmPreset */
  algorithmPreset: Types.ObjectId | string;
  /** Frozen copy of the associated AlgorithmPreset at snapshot creation time */
  algorithmPresetFrozen: AlgorithmPresetFrozen;
  /** Algorithm execution outputs/results */
  outputs?: SnapshotOutputs;
  /** Error information when execution fails */
  error?: SnapshotError;
  /** Timestamp when execution started (status changed to 'running') */
  startedAt?: Date;
  /** Timestamp when execution completed (status changed to 'completed' or 'failed') */
  completedAt?: Date;
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
