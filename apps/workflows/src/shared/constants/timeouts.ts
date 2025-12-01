/**
 * Default timeout durations for Temporal activities and workflows.
 */

/**
 * Default timeout for database activities.
 * Short timeout for fast DB operations.
 */
export const DB_ACTIVITY_TIMEOUT = '1 minute';

/**
 * Default timeout for algorithm library activities.
 * Quick lookup operations from the algorithm registry.
 */
export const ALGORITHM_LIBRARY_TIMEOUT = '30 seconds';

/**
 * Default timeout for algorithm execution activities.
 * Long timeout to accommodate complex computations and large data processing.
 */
export const ALGORITHM_EXECUTION_TIMEOUT = '30 minutes';

/**
 * Default task queue name for workflow orchestration.
 */
export const WORKFLOWS_TASK_QUEUE = 'workflows';
