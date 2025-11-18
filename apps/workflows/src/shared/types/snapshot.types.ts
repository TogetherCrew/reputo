/**
 * Input type for RunSnapshotWorkflow.
 *
 * Defines the minimal data required to start a snapshot execution workflow.
 */
export interface RunSnapshotWorkflowInput {
  /** MongoDB ObjectId of the snapshot to execute */
  snapshotId: string;
}
