/**
 * ExecuteAlgorithmWorkflow - Child workflow for executing algorithm activities.
 *
 * This child workflow runs on the algorithm worker's task queue and executes
 * the algorithm activity. It's used by RunSnapshotWorkflow to call activities
 * on different task queues.
 *
 * Note: This workflow should be registered in the algorithm worker apps,
 * not in this workflows app. This file serves as a reference for the
 * algorithm worker implementation.
 */

import * as wf from '@temporalio/workflow';
import type {
  WorkflowAlgorithmActivity,
  WorkflowAlgorithmPayload,
  WorkflowAlgorithmResult,
} from '../shared/index.js';

/**
 * ExecuteAlgorithmWorkflow - Executes an algorithm activity.
 *
 * This workflow is meant to be registered in algorithm worker apps.
 * It receives the algorithm payload and executes the corresponding activity.
 *
 * @param payload - Algorithm execution payload
 * @returns Algorithm execution result
 */
export async function ExecuteAlgorithmWorkflow(
  payload: WorkflowAlgorithmPayload,
): Promise<WorkflowAlgorithmResult> {
  // This workflow should be implemented in the algorithm worker app
  // where the algorithm activities are registered.
  // For now, this is a placeholder that algorithm workers should implement.
  
  throw new Error(
    'ExecuteAlgorithmWorkflow must be implemented in the algorithm worker app',
  );
}

