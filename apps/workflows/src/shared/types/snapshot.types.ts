/**
 * Types for snapshot workflow operations.
 */

/**
 * Input type for the orchestrator workflow.
 */
export interface OrchestratorWorkflowInput {
  /** MongoDB ObjectId of the snapshot to execute */
  snapshotId: string;
}
