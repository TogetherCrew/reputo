import { HydratedDocument, Model } from 'mongoose';

/**
 * Interface defining the structure of an AlgorithmPreset document.
 *
 * Represents a configuration preset for an algorithm with specific
 * version and input parameters.
 */
export interface AlgorithmPreset {
  /** Algorithm specification containing key and version */
  spec: {
    /** Unique algorithm identifier (e.g., 'voting_engagement') */
    key: string;
    /** Algorithm version (e.g., '1.0.0') */
    version: string;
  };
  /** Array of input parameters for the algorithm */
  inputs: {
    /** Parameter key/name */
    key: string;
    /** Parameter value (can be any type) */
    value?: unknown;
  }[];
  /** Optional human-readable name for the preset */
  name?: string;
  /** Optional description of the preset */
  description?: string;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Type representing a hydrated AlgorithmPreset document with Mongoose methods.
 */
export type AlgorithmPresetDoc = HydratedDocument<AlgorithmPreset>;

/**
 * Interface extending Mongoose Model with additional methods for AlgorithmPreset.
 */
export interface AlgorithmPresetModel extends Model<AlgorithmPreset> {
  /** Pagination method for querying presets */
  paginate: (filter: object, options: object) => Promise<unknown>;
}
