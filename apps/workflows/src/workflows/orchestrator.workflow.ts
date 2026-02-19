import * as workflow from '@temporalio/workflow';

import {
  ACTIVITY_MAX_ATTEMPTS,
  ALGORITHM_EXECUTION_TIMEOUT,
  ALGORITHM_LIBRARY_TIMEOUT,
  DB_ACTIVITY_TIMEOUT,
  DEPENDENCY_RESOLUTION_TIMEOUT,
  HEARTBEAT_TIMEOUT,
} from '../shared/constants/index.js';
import { UnsupportedAlgorithmError } from '../shared/errors/index.js';
import type {
  AlgorithmLibraryActivities,
  AlgorithmResult,
  DbActivities,
  DependencyKey,
  DependencyResolverActivities,
  OrchestratorWorkflowInput,
  TypescriptAlgorithmDispatcherActivities,
} from '../shared/types/index.js';
import { getAlgorithmTaskQueueFromRuntime } from '../shared/utils/orchestrator-input.utils.js';

const { getSnapshot, updateSnapshot } = workflow.proxyActivities<DbActivities>({
  startToCloseTimeout: DB_ACTIVITY_TIMEOUT,
  retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
});

const { getAlgorithmDefinition } = workflow.proxyActivities<AlgorithmLibraryActivities>({
  startToCloseTimeout: ALGORITHM_LIBRARY_TIMEOUT,
  retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
});

export async function OrchestratorWorkflow(input: OrchestratorWorkflowInput): Promise<void> {
  const { snapshotId, taskQueues } = input;
  const workflowInfo = workflow.workflowInfo();
  const orchestratorTaskQueue = workflowInfo.taskQueue;

  workflow.log.info('Starting OrchestratorWorkflow', {
    snapshotId,
    workflowId: workflowInfo.workflowId,
    runId: workflowInfo.runId,
  });

  const { snapshot } = await getSnapshot({ snapshotId });

  workflow.log.info('Snapshot fetched', {
    snapshotId,
    status: snapshot.status,
    algorithmKey: snapshot.algorithmPresetFrozen?.key,
    algorithmVersion: snapshot.algorithmPresetFrozen?.version,
  });

  if (snapshot.status === 'completed') {
    workflow.log.warn('Snapshot already completed, skipping execution', {
      snapshotId,
      status: snapshot.status,
    });
    return;
  }

  if (!snapshot.algorithmPresetFrozen?.key || !snapshot.algorithmPresetFrozen?.version) {
    const message = 'Snapshot is missing algorithmPresetFrozen.key/version; cannot execute algorithm';
    workflow.log.error(message, { snapshotId });

    await updateSnapshot({
      snapshotId,
      status: 'failed',
      temporal: {
        workflowId: workflowInfo.workflowId,
        runId: workflowInfo.runId,
        taskQueue: orchestratorTaskQueue,
      },
      error: { message },
    });

    throw new Error(message);
  }

  await updateSnapshot({
    snapshotId,
    status: 'running',
    temporal: {
      workflowId: workflowInfo.workflowId,
      runId: workflowInfo.runId,
      taskQueue: orchestratorTaskQueue,
    },
  });

  workflow.log.info('Snapshot marked as running', { snapshotId });

  const algorithmKey = snapshot.algorithmPresetFrozen.key;
  const algorithmVersion = snapshot.algorithmPresetFrozen.version;

  const { definition } = await getAlgorithmDefinition({
    key: algorithmKey,
    version: algorithmVersion,
  });

  workflow.log.info('Algorithm definition loaded', {
    algorithmKey: definition.key,
    algorithmVersion: definition.version,
    runtime: definition.runtime,
    dependencyCount: definition.dependencies?.length ?? 0,
  });

  const runtime = definition.runtime;
  const algorithmTaskQueue = getAlgorithmTaskQueueFromRuntime(runtime, taskQueues);

  const { resolveDependency } = workflow.proxyActivities<DependencyResolverActivities>({
    taskQueue: orchestratorTaskQueue,
    startToCloseTimeout: DEPENDENCY_RESOLUTION_TIMEOUT,
    heartbeatTimeout: HEARTBEAT_TIMEOUT,
    retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
  });

  const typescriptAlgorithmActivities = workflow.proxyActivities<TypescriptAlgorithmDispatcherActivities>({
    taskQueue: algorithmTaskQueue,
    startToCloseTimeout: ALGORITHM_EXECUTION_TIMEOUT,
    heartbeatTimeout: HEARTBEAT_TIMEOUT,
    retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
  });

  // Resolve all dependencies in parallel (they are independent)
  if (definition.dependencies && definition.dependencies.length > 0) {
    workflow.log.info('Resolving algorithm dependencies in parallel', {
      snapshotId,
      algorithmKey,
      dependencies: definition.dependencies.map((d) => d.key),
    });

    await Promise.all(
      definition.dependencies.map(async (dependency) => {
        workflow.log.info('Resolving dependency', {
          dependencyKey: dependency.key,
          snapshotId,
        });

        await resolveDependency({
          dependencyKey: dependency.key as DependencyKey,
          snapshotId,
        });

        workflow.log.info('Dependency resolved', {
          dependencyKey: dependency.key,
          snapshotId,
        });
      }),
    );

    workflow.log.info('All dependencies resolved', {
      snapshotId,
      algorithmKey,
    });
  }

  try {
    workflow.log.info('Executing algorithm activity', {
      algorithmKey,
      algorithmTaskQueue,
      snapshotId,
    });

    let result: AlgorithmResult;
    if (runtime === 'typescript') {
      result = await typescriptAlgorithmActivities.runTypescriptAlgorithm(snapshot);
    } else {
      throw new UnsupportedAlgorithmError(algorithmKey);
    }

    workflow.log.info('Algorithm execution completed successfully', {
      snapshotId,
      algorithmKey,
      outputKeys: Object.keys(result.outputs),
    });

    await updateSnapshot({
      snapshotId,
      status: 'completed',
      outputs: result.outputs as Record<string, string>,
      temporal: {
        workflowId: workflowInfo.workflowId,
        runId: workflowInfo.runId,
        taskQueue: orchestratorTaskQueue,
        algorithmTaskQueue,
      },
    });

    workflow.log.info('Snapshot marked as completed', { snapshotId });
  } catch (error) {
    const isCancelled = workflow.isCancellation(error);
    const status = isCancelled ? 'cancelled' : 'failed';
    const message = isCancelled ? 'Workflow was cancelled' : (error as Error).message || 'Unknown error';

    workflow.log.error('Algorithm execution failed', {
      snapshotId,
      cancelled: isCancelled,
      error: message,
    });

    // Use a non-cancellable scope so the status update completes even during cancellation
    await workflow.CancellationScope.nonCancellable(async () => {
      await updateSnapshot({
        snapshotId,
        status,
        temporal: {
          workflowId: workflowInfo.workflowId,
          runId: workflowInfo.runId,
          taskQueue: orchestratorTaskQueue,
          algorithmTaskQueue,
        },
        error: { message },
      });
    });

    workflow.log.info(`Snapshot marked as ${status}`, { snapshotId });
    throw error;
  }
}
