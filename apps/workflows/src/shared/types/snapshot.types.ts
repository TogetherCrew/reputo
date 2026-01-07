/**
 * Types for snapshot workflow operations.
 */

/**
 * Input type for the orchestrator workflow.
 */
export interface OrchestratorWorkflowInput {
  /** MongoDB ObjectId of the snapshot to execute */
  snapshotId: string;
  /**
   * Task queues used by the orchestrator to route activities to the correct workers.
   *
   * Note: Workflow code should not read process env; these must be passed in from the caller (API).
   */
  taskQueues?: {
    /** Task queue for TypeScript algorithm worker activities */
    typescript?: string;
    /** Task queue for Python algorithm worker activities (reserved for future runtimes) */
    python?: string;
  };
}
