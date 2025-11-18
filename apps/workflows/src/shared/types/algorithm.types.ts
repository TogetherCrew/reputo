/**
 * Payload sent to algorithm worker activities for execution.
 *
 * Contains all necessary information for an algorithm worker to:
 * - Identify the snapshot being processed
 * - Determine which algorithm version to execute
 * - Access input data locations (e.g., S3 keys)
 */
export interface WorkflowAlgorithmPayload {
  /** MongoDB ObjectId of the snapshot being executed */
  snapshotId: string;
  /** Algorithm key (e.g., 'voting_engagement') */
  algorithmKey: string;
  /** Algorithm version (e.g., '1.0.0') */
  algorithmVersion: string;
  /** 
   * Input data locations indexed by input key.
   * Each value is typically an S3 key or other storage location reference.
   * The structure matches the algorithm's input definitions.
   */
  inputLocations: Record<string, unknown>;
}

/**
 * Result returned by algorithm worker activities after execution.
 *
 * Contains output data locations that will be stored in the snapshot document.
 */
export interface WorkflowAlgorithmResult {
  /** 
   * Output data locations indexed by output key.
   * Each value is typically an S3 key or other storage location reference.
   * The structure matches the algorithm's output definitions.
   */
  outputs: Record<string, unknown>;
}

/**
 * Type signature for algorithm worker activities.
 *
 * All algorithm workers must implement activities with this signature.
 * The activity name and task queue are specified in the AlgorithmDefinition.runtime.
 */
export type WorkflowAlgorithmActivity = (
  payload: WorkflowAlgorithmPayload,
) => Promise<WorkflowAlgorithmResult>;

