import { describe, expect, it, vi } from 'vitest';
import {
  algorithmTypescriptTaskQueue,
  DEPENDENCY_RESOLUTION_TIMEOUT,
  ONCHAIN_DATA_DEPENDENCY_RESOLUTION_TIMEOUT,
  onchainDataTaskQueue,
  SnapshotStatus,
} from '../../../src/shared/constants/index.js';

vi.mock('@temporalio/workflow', () => ({
  proxyActivities: vi.fn(),
  workflowInfo: vi.fn(),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('OrchestratorWorkflow task queue routing', () => {
  it('routes dependency resolution to the orchestrator task queue and algorithm execution to the algorithm task queue', async () => {
    vi.resetModules();

    const temporalWorkflow = await import('@temporalio/workflow');
    const proxyActivities = vi.mocked(temporalWorkflow.proxyActivities);
    const workflowInfo = vi.mocked(temporalWorkflow.workflowInfo);

    workflowInfo.mockReturnValue({
      workflowId: 'wf-1',
      runId: 'run-1',
      taskQueue: 'orchestrator-q',
    } as never);

    const recordedOptions: Array<Record<string, unknown>> = [];

    const getSnapshot = vi.fn().mockResolvedValue({
      snapshot: {
        status: SnapshotStatus.queued,
        algorithmPresetFrozen: {
          key: 'algo-key',
          version: '1.0.0',
          inputs: [],
        },
      },
    });
    const updateSnapshot = vi.fn().mockResolvedValue(undefined);
    const getAlgorithmDefinition = vi.fn().mockResolvedValue({
      algorithmDefinition: {
        key: 'algo-key',
        version: '1.0.0',
        runtime: 'typescript',
        dependencies: [{ key: 'deepfunding-portal-api' }],
      },
    });
    const resolveDependency = vi.fn().mockResolvedValue(undefined);
    const runTypescriptAlgorithm = vi.fn().mockResolvedValue({
      outputs: { some_key: 'some_value' },
    });

    proxyActivities.mockImplementation((opts) => {
      recordedOptions.push(opts as Record<string, unknown>);
      // Return a superset of activity functions; callers destructure the ones they need.
      return {
        getSnapshot,
        updateSnapshot,
        getAlgorithmDefinition,
        resolveDependency,
        runTypescriptAlgorithm,
      } as never;
    });

    const { OrchestratorWorkflow } = await import('../../../src/workflows/orchestrator.workflow.js');

    await OrchestratorWorkflow({
      snapshotId: 'snapshot-1',
    });

    // Order:
    // 0: DbActivities (module import)
    // 1: AlgorithmLibraryActivities (module import)
    // 2: DependencyResolverActivities — orchestrator queue (inside workflow)
    // 3: DependencyResolverActivities — onchain queue (inside workflow)
    // 4: TypescriptAlgorithmDispatcherActivities (inside workflow)
    expect(recordedOptions[2]).toMatchObject({
      taskQueue: 'orchestrator-q',
      startToCloseTimeout: DEPENDENCY_RESOLUTION_TIMEOUT,
      heartbeatTimeout: expect.any(String),
    });
    expect(recordedOptions[3]).toMatchObject({
      taskQueue: onchainDataTaskQueue,
      startToCloseTimeout: ONCHAIN_DATA_DEPENDENCY_RESOLUTION_TIMEOUT,
    });
    expect(recordedOptions[3]).not.toHaveProperty('heartbeatTimeout');
    expect(recordedOptions[4]).toMatchObject({ taskQueue: algorithmTypescriptTaskQueue });
    expect(resolveDependency).toHaveBeenCalledWith({
      dependencyKey: 'deepfunding-portal-api',
      snapshotId: 'snapshot-1',
    });
  });

  it('routes onchain-data dependency resolution to the onchain task queue', async () => {
    vi.resetModules();

    const temporalWorkflow = await import('@temporalio/workflow');
    const proxyActivities = vi.mocked(temporalWorkflow.proxyActivities);
    const workflowInfo = vi.mocked(temporalWorkflow.workflowInfo);

    workflowInfo.mockReturnValue({
      workflowId: 'wf-1',
      runId: 'run-1',
      taskQueue: 'orchestrator-q',
    } as never);

    const recordedOptions: Array<Record<string, unknown>> = [];

    const getSnapshot = vi.fn().mockResolvedValue({
      snapshot: {
        status: SnapshotStatus.queued,
        algorithmPresetFrozen: {
          key: 'algo-key',
          version: '1.0.0',
          inputs: [],
        },
      },
    });
    const updateSnapshot = vi.fn().mockResolvedValue(undefined);
    const getAlgorithmDefinition = vi.fn().mockResolvedValue({
      algorithmDefinition: {
        key: 'algo-key',
        version: '1.0.0',
        runtime: 'typescript',
        dependencies: [{ key: 'onchain-data' }],
      },
    });
    const resolveDependency = vi.fn().mockResolvedValue(undefined);
    const runTypescriptAlgorithm = vi.fn().mockResolvedValue({
      outputs: { some_key: 'some_value' },
    });

    proxyActivities.mockImplementation((opts) => {
      recordedOptions.push(opts as Record<string, unknown>);
      return {
        getSnapshot,
        updateSnapshot,
        getAlgorithmDefinition,
        resolveDependency,
        runTypescriptAlgorithm,
      } as never;
    });

    const { OrchestratorWorkflow } = await import('../../../src/workflows/orchestrator.workflow.js');

    await OrchestratorWorkflow({
      snapshotId: 'snapshot-1',
    });

    expect(recordedOptions[3]).toMatchObject({
      taskQueue: onchainDataTaskQueue,
      startToCloseTimeout: ONCHAIN_DATA_DEPENDENCY_RESOLUTION_TIMEOUT,
    });
    expect(recordedOptions[3]).not.toHaveProperty('heartbeatTimeout');
    expect(resolveDependency).toHaveBeenCalledWith({
      dependencyKey: 'onchain-data',
      snapshotId: 'snapshot-1',
    });
  });
});
