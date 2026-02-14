export const DB_ACTIVITY_TIMEOUT = '1 minute';
export const ALGORITHM_LIBRARY_TIMEOUT = '30 seconds';
export const ALGORITHM_EXECUTION_TIMEOUT = '10 minutes';
export const DEEPFUNDING_SYNC_TIMEOUT = '30 minutes';
export const DEPENDENCY_RESOLUTION_TIMEOUT = '30 minutes';
export const WORKFLOW_RUN_TIMEOUT = '2 hours';
export const HEARTBEAT_TIMEOUT = '2 minutes';
export const ACTIVITY_MAX_ATTEMPTS = 3;

/** How many items to process between heartbeat calls inside algorithm loops. */
export const HEARTBEAT_INTERVAL = 100;

/** Max concurrent activity executions for the orchestrator worker. */
export const ORCHESTRATOR_MAX_CONCURRENT_ACTIVITIES = 1;

/** Max concurrent activity executions for the TypeScript algorithm worker. */
export const ALGORITHM_MAX_CONCURRENT_ACTIVITIES = 1;
