/**
 * Payload received by algorithm activities from workflows.
 *
 * Must remain JSON-compatible with payloads built in apps/workflows.
 */
export interface WorkerAlgorithmPayload {
  /**
   * Unique identifier for the snapshot being processed.
   */
  snapshotId: string;

  /**
   * Algorithm key (e.g. "voting_engagement").
   */
  algorithmKey: string;

  /**
   * Algorithm version string (e.g. "1.0.0").
   */
  algorithmVersion: string;

  /**
   * Input locations for the algorithm.
   * Typically storage keys or other references passed from workflows.
   *
   * Example: [{ key: 'votes', value: 'snapshots/123/inputs/votes.csv' }, ...]
   */
  inputLocations: Array<{ key: string; value: unknown }>;
}

/**
 * Result returned by algorithm activities to workflows.
 */
export interface WorkerAlgorithmResult {
  /**
   * Algorithm outputs, mapping logical output keys to storage keys or inline values.
   *
   * Keys must match AlgorithmDefinition.outputs[].key.
   */
  outputs: Record<string, unknown>;
}

