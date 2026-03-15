import { SnapshotStatus } from '@reputo/database';
import { describe, expect, it, vi } from 'vitest';

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
      definition: {
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

    proxyActivities.mockImplementation((opts: Record<string, unknown>) => {
      recordedOptions.push(opts);
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
      taskQueues: {
        typescript: 'algorithm-q',
      },
    });

    // Order:
    // 0: DbActivities (module import)
    // 1: AlgorithmLibraryActivities (module import)
    // 2: DependencyResolverActivities (inside workflow)
    // 3: TypescriptAlgorithmDispatcherActivities (inside workflow)
    expect(recordedOptions[2]).toMatchObject({
      taskQueue: 'orchestrator-q',
    });
    expect(recordedOptions[3]).toMatchObject({ taskQueue: 'algorithm-q' });
    expect(resolveDependency).toHaveBeenCalledWith({
      dependencyKey: 'deepfunding-portal-api',
      snapshotId: 'snapshot-1',
    });
  });
});
