import type { FilterQuery, HydratedDocument, Model } from 'mongoose';
import type { PaginateOptions, PaginateResult } from '../plugins/index.js';

/**
 * Interface defining the structure of an AlgorithmPreset document.
 *
 * Represents a configuration preset for an algorithm with specific
 * version and input parameters.
 */
export interface AlgorithmPreset {
  /** Unique algorithm identifier (e.g., 'voting_engagement') */
  key: string;
  /** Algorithm version (e.g., '1.0.0') */
  version: string;
  /** Array of input parameters for the algorithm */
  inputs: {
    /** Parameter key/name */
    key: string;
    /** Parameter value (can be any type) */
    value?: unknown;
  }[];
  /** Optional human-readable name for the preset (3-100 characters) */
  name?: string;
  /** Optional description of the preset (10-500 characters) */
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
  paginate: (
    filter: FilterQuery<AlgorithmPreset>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<AlgorithmPresetDoc>>;
}
