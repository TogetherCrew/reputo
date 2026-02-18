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
   * Passed in from the caller (API); workflow code must not read process env.
   */
  taskQueues: {
    /** Task queue for TypeScript algorithm worker activities */
    typescript: string;
    /** Task queue for Python algorithm worker activities (reserved for future runtimes) */
    python?: string;
  };
}
