/**
 * Types for algorithm worker activities.
 *
 * These types define the contract between the orchestrator workflow
 * and algorithm worker activities.
 */

/**
 * Storage configuration for algorithm activities.
 */
export interface StorageConfig {
  bucket: string;
  maxSizeBytes: number;
}

/**
 * Result returned by algorithm activities to workflows.
 */
export interface AlgorithmResult {
  /**
   * Algorithm outputs, mapping logical output keys to storage keys or inline values.
   * Keys must match AlgorithmDefinition.outputs[].key.
   */
  outputs: Record<string, unknown>;
}
