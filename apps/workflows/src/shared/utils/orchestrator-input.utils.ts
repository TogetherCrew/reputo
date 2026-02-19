import type { OrchestratorWorkflowInput } from '../types/index.js';

export function getAlgorithmTaskQueueFromRuntime(
  runtime: unknown,
  taskQueues: OrchestratorWorkflowInput['taskQueues'],
): string {
  if (runtime === 'typescript') {
    return taskQueues.typescript;
  }
  if (runtime === 'python') {
    if (!taskQueues.python) {
      throw new Error('Python task queue is required for python runtime');
    }
    return taskQueues.python;
  }
  throw new Error(`Unsupported algorithm runtime: ${String(runtime)}`);
}
