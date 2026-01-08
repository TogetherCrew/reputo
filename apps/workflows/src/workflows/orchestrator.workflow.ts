import * as workflow from '@temporalio/workflow';

import {
  ALGORITHM_EXECUTION_TIMEOUT,
  ALGORITHM_LIBRARY_TIMEOUT,
  DB_ACTIVITY_TIMEOUT,
  DEPENDENCY_RESOLUTION_TIMEOUT,
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
import {
  getAlgorithmTaskQueueFromRuntime,
  normalizeOrchestratorWorkflowInput,
} from '../shared/utils/orchestrator-input.utils.js';

const { getSnapshot, updateSnapshot } = workflow.proxyActivities<DbActivities>({
  startToCloseTimeout: DB_ACTIVITY_TIMEOUT,
});

const { getAlgorithmDefinition } = workflow.proxyActivities<AlgorithmLibraryActivities>({
  startToCloseTimeout: ALGORITHM_LIBRARY_TIMEOUT,
});

export async function OrchestratorWorkflow(input: string | OrchestratorWorkflowInput): Promise<void> {
  const { snapshotId, taskQueues } = normalizeOrchestratorWorkflowInput(input);
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
      error: {
        message,
        timestamp: Date.now(),
      },
    });

    throw new Error(message);
  }

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
    taskQueue: algorithmTaskQueue,
    startToCloseTimeout: DEPENDENCY_RESOLUTION_TIMEOUT,
  });

  const typescriptAlgorithmActivities = workflow.proxyActivities<TypescriptAlgorithmDispatcherActivities>({
    taskQueue: algorithmTaskQueue,
    startToCloseTimeout: ALGORITHM_EXECUTION_TIMEOUT,
  });

  if (definition.dependencies && definition.dependencies.length > 0) {
    workflow.log.info('Resolving algorithm dependencies', {
      snapshotId,
      algorithmKey,
      dependencies: definition.dependencies.map((d) => d.key),
    });

    for (const dependency of definition.dependencies) {
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
    }

    workflow.log.info('All dependencies resolved', {
      snapshotId,
      algorithmKey,
    });
  }

  await updateSnapshot({
    snapshotId,
    status: 'running',
    temporal: {
      workflowId: workflowInfo.workflowId,
      runId: workflowInfo.runId,
      taskQueue: orchestratorTaskQueue,
      algorithmTaskQueue,
    },
  });

  workflow.log.info('Snapshot marked as running', {
    snapshotId,
    algorithmTaskQueue,
  });

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
    const err = error as Error;
    workflow.log.error('Algorithm execution failed', {
      snapshotId,
      error: err.message,
      stack: err.stack,
    });

    await updateSnapshot({
      snapshotId,
      status: 'failed',
      temporal: {
        workflowId: workflowInfo.workflowId,
        runId: workflowInfo.runId,
        taskQueue: orchestratorTaskQueue,
        algorithmTaskQueue,
      },
      error: {
        message: err.message || 'Unknown error',
        timestamp: Date.now(),
      },
    });

    workflow.log.info('Snapshot marked as failed', { snapshotId });
    throw error;
  }
}
