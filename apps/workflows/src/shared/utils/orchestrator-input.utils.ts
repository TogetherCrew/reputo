import { algorithmPythonTaskQueue, algorithmTypescriptTaskQueue } from '../constants/index.js';

export function getAlgorithmTaskQueueFromRuntime(runtime: unknown): string {
  if (runtime === 'typescript') {
    return algorithmTypescriptTaskQueue;
  }
  if (runtime === 'python') {
    return algorithmPythonTaskQueue;
  }
  throw new Error(`Unsupported algorithm runtime: ${String(runtime)}`);
}
