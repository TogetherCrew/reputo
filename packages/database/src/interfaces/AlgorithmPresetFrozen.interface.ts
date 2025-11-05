/**
 * Interface representing a frozen snapshot of an AlgorithmPreset.
 *
 * This immutable copy mirrors the AlgorithmPreset shape and is embedded within a Snapshot document.
 */
export interface AlgorithmPresetFrozen {
  /** Unique algorithm identifier (e.g., 'voting_engagement') */
  key: string;
  /** Algorithm version (e.g., '1.0.0') */
  version: string;
  /** Array of input parameters for the algorithm */
  inputs: Array<{
    /** Parameter key/name */
    key: string;
    /** Parameter value (can be any type) */
    value?: unknown;
  }>;
  /** Optional human-readable name for the preset (3-100 characters) */
  name?: string;
  /** Optional description of the preset (10-500 characters) */
  description?: string;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}
