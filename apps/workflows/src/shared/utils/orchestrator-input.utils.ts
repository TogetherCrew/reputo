import type { OrchestratorWorkflowInput } from '../types/index.js';

export type OrchestratorWorkflowStartArg = string | OrchestratorWorkflowInput;

export function normalizeOrchestratorWorkflowInput(input: OrchestratorWorkflowStartArg): OrchestratorWorkflowInput {
  if (typeof input === 'string') {
    return { snapshotId: input };
  }
  return input;
}

export function getAlgorithmTaskQueueFromRuntime(
  runtime: unknown,
  taskQueues: OrchestratorWorkflowInput['taskQueues'] | undefined,
): string {
  if (runtime === 'typescript') {
    if (taskQueues?.typescript) {
      return taskQueues.typescript;
    }
    // Backwards-compatible fallback when older callers don't pass queues.
    return 'algorithm-typescript-worker';
  }
  if (runtime === 'python') {
    if (taskQueues?.python) {
      return taskQueues.python;
    }
    // Backwards-compatible fallback when older callers don't pass queues.
    return 'algorithm-python-worker';
  }
  throw new Error(`Unsupported algorithm runtime: ${String(runtime)}`);
}
