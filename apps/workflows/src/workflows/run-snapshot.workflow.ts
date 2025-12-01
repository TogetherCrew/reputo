/**
 * RunSnapshotWorkflow - Main orchestration workflow for algorithm execution.
 *
 * Orchestrates the end-to-end execution of a reputation algorithm for a given snapshot.
 * This workflow:
 * - Fetches snapshot data from MongoDB
 * - Loads the algorithm definition
 * - Dispatches execution to the appropriate algorithm worker
 * - Updates the snapshot with results or errors
 *
 * The workflow treats all data as opaque locations (e.g., S3 keys) and does not
 * perform direct I/O operations. Storage operations are handled by algorithm workers.
 */

import * as wf from '@temporalio/workflow';
import type { WorkflowsActivities } from '../activities/index.js';
import {
  ALGORITHM_EXECUTION_TIMEOUT,
  ALGORITHM_LIBRARY_TIMEOUT,
  DB_ACTIVITY_TIMEOUT,
  type RunSnapshotWorkflowInput,
  type WorkflowAlgorithmActivity,
  type WorkflowAlgorithmPayload,
  type WorkflowAlgorithmResult,
} from '../shared/index.js';

// Proxy activities with appropriate timeouts
const { getSnapshot, updateSnapshot } = wf.proxyActivities<WorkflowsActivities>({
  startToCloseTimeout: DB_ACTIVITY_TIMEOUT,
});

const { getAlgorithmDefinition } = wf.proxyActivities<WorkflowsActivities>({
  startToCloseTimeout: ALGORITHM_LIBRARY_TIMEOUT,
});

/**
 * RunSnapshotWorkflow - Executes a reputation algorithm for a snapshot.
 *
 * Workflow execution stages:
 * 1. Fetch snapshot document and frozen preset from MongoDB
 * 2. Validate snapshot state (skip if already completed)
 * 3. Mark snapshot as 'processing' with Temporal metadata
 * 4. Load algorithm definition from the registry
 * 5. Build execution payload with input locations
 * 6. Execute algorithm worker activity on the configured task queue
 * 7. Update snapshot with outputs (success) or error (failure)
 *
 * @param input - Workflow input containing the snapshot ID
 *
 * @example
 * ```ts
 * import { Client } from '@temporalio/client'
 *
 * const client = new Client()
 * await client.workflow.start('RunSnapshotWorkflow', {
 *   taskQueue: 'workflows',
 *   workflowId: 'snapshot-507f1f77bcf86cd799439011',
 *   args: [{ snapshotId: '507f1f77bcf86cd799439011' }]
 * })
 * ```
 */
export async function RunSnapshotWorkflow(input: RunSnapshotWorkflowInput): Promise<void> {
  const { snapshotId } = input;
  const info = wf.workflowInfo();

  wf.log.info('Starting RunSnapshotWorkflow', {
    snapshotId,
    workflowId: info.workflowId,
    runId: info.runId,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 1: Fetch snapshot and frozen preset
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const { snapshot } = await getSnapshot({ snapshotId });

  wf.log.info('Snapshot fetched', {
    snapshotId,
    status: snapshot.status,
    algorithmKey: snapshot.algorithmPresetFrozen?.key,
    algorithmVersion: snapshot.algorithmPresetFrozen?.version,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 2: Validate snapshot state
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (snapshot.status === 'completed') {
    wf.log.warn('Snapshot already completed, skipping execution', {
      snapshotId,
      status: snapshot.status,
    });
    return;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 3: Mark snapshot as processing
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  await updateSnapshot({
    snapshotId,
    status: 'running',
    temporal: {
      workflowId: info.workflowId,
      runId: info.runId,
      taskQueue: info.taskQueue,
    },
  });

  wf.log.info('Snapshot marked as running', { snapshotId });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 4: Load algorithm definition
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const { definition } = await getAlgorithmDefinition({
    key: snapshot.algorithmPresetFrozen.key,
    version: snapshot.algorithmPresetFrozen.version,
  });

  wf.log.info('Algorithm definition loaded', {
    algorithmKey: definition.key,
    algorithmVersion: definition.version,
    runtime: definition.runtime,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 5: Build algorithm execution payload
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Transform preset inputs to input locations map
  const inputLocations: Record<string, unknown> = {};
  for (const input of snapshot.algorithmPresetFrozen.inputs) {
    if (input.value !== undefined) {
      inputLocations[input.key] = input.value;
    }
  }

  const payload: WorkflowAlgorithmPayload = {
    snapshotId,
    algorithmKey: definition.key,
    algorithmVersion: definition.version,
    inputLocations,
  };

  wf.log.info('Algorithm execution payload prepared', {
    snapshotId,
    inputCount: Object.keys(inputLocations).length,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Stage 6: Execute algorithm worker activity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  try {
    wf.log.info('Executing algorithm worker', {
      activity: definition.runtime.activity,
      taskQueue: definition.runtime.taskQueue,
      snapshotId,
    });

    // Use child workflow to execute algorithm activity on different task queue
    // The child workflow runs on the algorithm worker's task queue
    // Algorithm workers must register a workflow named 'ExecuteAlgorithmWorkflow'
    // that accepts WorkflowAlgorithmPayload and returns WorkflowAlgorithmResult
    const result = (await wf.executeChild('ExecuteAlgorithmWorkflow', {
      args: [payload],
      taskQueue: definition.runtime.taskQueue,
      workflowId: `algorithm-${snapshotId}-${info.runId}`,
      workflowExecutionTimeout: ALGORITHM_EXECUTION_TIMEOUT,
      retry: {
        initialInterval: '1 minute',
        maximumInterval: '10 minutes',
        backoffCoefficient: 2,
        maximumAttempts: 3,
      },
    })) as WorkflowAlgorithmResult;

    wf.log.info('Algorithm execution completed successfully', {
      snapshotId,
      outputCount: Object.keys(result.outputs).length,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 7a: Update snapshot with success
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    await updateSnapshot({
      snapshotId,
      status: 'completed',
      outputs: result.outputs as Record<string, string>,
      temporal: {
        workflowId: info.workflowId,
        runId: info.runId,
        taskQueue: definition.runtime.taskQueue,
      },
    });

    wf.log.info('Snapshot marked as completed', { snapshotId });
  } catch (error) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Stage 7b: Update snapshot with failure
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const err = error as Error;
    wf.log.error('Algorithm execution failed', {
      snapshotId,
      error: err.message,
      stack: err.stack,
    });

    await updateSnapshot({
      snapshotId,
      status: 'failed',
      temporal: {
        workflowId: info.workflowId,
        runId: info.runId,
        taskQueue: info.taskQueue,
      },
      error: {
        message: err.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });

    wf.log.info('Snapshot marked as failed', { snapshotId });

    // Rethrow to mark workflow run as failed
    throw error;
  }
}
