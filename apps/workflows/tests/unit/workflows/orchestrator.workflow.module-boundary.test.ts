import { describe, expect, it, vi } from 'vitest';

vi.mock('@temporalio/workflow', () => ({
  proxyActivities: vi.fn(),
  workflowInfo: vi.fn(),
  isCancellation: vi.fn(),
  CancellationScope: {
    nonCancellable: vi.fn(async (fn: () => Promise<unknown>) => fn()),
  },
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('OrchestratorWorkflow module boundaries', () => {
  it('does not import @reputo/database in workflow runtime module', async () => {
    vi.resetModules();
    const temporalWorkflow = await import('@temporalio/workflow');
    vi.mocked(temporalWorkflow.proxyActivities).mockImplementation(
      () =>
        ({
          getSnapshot: vi.fn(),
          updateSnapshot: vi.fn(),
          getAlgorithmDefinition: vi.fn(),
        }) as never,
    );

    vi.doMock('@reputo/database', () => {
      throw new Error('Workflow module must not import @reputo/database at runtime');
    });

    await expect(import('../../../src/workflows/orchestrator.workflow.js')).resolves.toBeDefined();
  });
});
