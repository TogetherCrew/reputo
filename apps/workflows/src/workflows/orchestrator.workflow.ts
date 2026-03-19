import * as workflow from '@temporalio/workflow';
import {
  ACTIVITY_MAX_ATTEMPTS,
  ALGORITHM_EXECUTION_TIMEOUT,
  ALGORITHM_LIBRARY_TIMEOUT,
  DB_ACTIVITY_TIMEOUT,
  DEPENDENCY_RESOLUTION_TIMEOUT,
  HEARTBEAT_TIMEOUT,
  ONCHAIN_DATA_DEPENDENCY_RESOLUTION_TIMEOUT,
  onchainDataTaskQueue,
  SnapshotStatus,
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
  const { snapshotId } = input;
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

  if (snapshot.status === SnapshotStatus.completed) {
    workflow.log.warn('Snapshot already completed, skipping execution', {
      snapshotId,
      status: snapshot.status,
    });
    return;
  }

  await updateSnapshot({
    snapshotId,
    status: SnapshotStatus.running,
    temporal: {
      workflowId: workflowInfo.workflowId,
      runId: workflowInfo.runId,
      taskQueue: orchestratorTaskQueue,
    },
  });
  workflow.log.info('Snapshot marked as running', { snapshotId });

  const algorithmKey = snapshot.algorithmPresetFrozen.key;
  const algorithmVersion = snapshot.algorithmPresetFrozen.version;

  const { algorithmDefinition } = await getAlgorithmDefinition({
    key: algorithmKey,
    version: algorithmVersion,
  });

  workflow.log.info('Algorithm definition loaded', {
    snapshotId,
    algorithmKey: algorithmDefinition.key,
    algorithmVersion: algorithmDefinition.version,
  });

  const runtime = algorithmDefinition.runtime;
  const algorithmTaskQueue = getAlgorithmTaskQueueFromRuntime(runtime);

  const { resolveDependency: resolveOrchestratorDependency } = workflow.proxyActivities<DependencyResolverActivities>({
    taskQueue: orchestratorTaskQueue,
    startToCloseTimeout: DEPENDENCY_RESOLUTION_TIMEOUT,
    heartbeatTimeout: HEARTBEAT_TIMEOUT,
    retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
  });

  const { resolveDependency: resolveOnchainDataDependency } = workflow.proxyActivities<DependencyResolverActivities>({
    taskQueue: onchainDataTaskQueue,
    startToCloseTimeout: ONCHAIN_DATA_DEPENDENCY_RESOLUTION_TIMEOUT,
    retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
  });

  const typescriptAlgorithmActivities = workflow.proxyActivities<TypescriptAlgorithmDispatcherActivities>({
    taskQueue: algorithmTaskQueue,
    startToCloseTimeout: ALGORITHM_EXECUTION_TIMEOUT,
    heartbeatTimeout: HEARTBEAT_TIMEOUT,
    retry: { maximumAttempts: ACTIVITY_MAX_ATTEMPTS },
  });

  if (algorithmDefinition.dependencies && algorithmDefinition.dependencies.length > 0) {
    workflow.log.info('Resolving algorithm dependencies', {
      snapshotId,
      dependencies: algorithmDefinition.dependencies.map((d) => d.key),
    });

    await Promise.all(
      algorithmDefinition.dependencies.map(async (dependency) => {
        const dependencyKey = dependency.key as DependencyKey;
        if (dependencyKey === 'onchain-data') {
          await resolveOnchainDataDependency({
            dependencyKey,
            snapshotId,
          });
        } else {
          await resolveOrchestratorDependency({
            dependencyKey,
            snapshotId,
          });
        }
      }),
    );

    workflow.log.info('All dependencies resolved', {
      snapshotId,
      algorithmKey,
    });
  }

  try {
    workflow.log.info('Executing algorithm activity (on-chain SQLite may be used for transfer data)', {
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
      status: SnapshotStatus.completed,
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
    const status = isCancelled ? SnapshotStatus.cancelled : SnapshotStatus.failed;
    const message = isCancelled ? 'Workflow was cancelled' : (error as Error).message || 'Unknown error';

    workflow.log.error('Algorithm execution failed', {
      snapshotId,
      cancelled: isCancelled,
      error: message,
    });

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
