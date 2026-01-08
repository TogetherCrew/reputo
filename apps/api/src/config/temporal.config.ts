import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('temporal', () => ({
  address: process.env.TEMPORAL_ADDRESS,
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  /**
   * Orchestrator workflow task queue.
   *
   * Backwards compatible:
   * - Prefer TEMPORAL_ORCHESTRATOR_TASK_QUEUE
   * - Fallback to TEMPORAL_TASK_QUEUE
   */
  orchestratorTaskQueue: process.env.TEMPORAL_ORCHESTRATOR_TASK_QUEUE || process.env.TEMPORAL_TASK_QUEUE || 'workflows',
  /**
   * Legacy alias for orchestrator queue (kept for backwards compatibility).
   * Prefer `orchestratorTaskQueue`.
   */
  taskQueue: process.env.TEMPORAL_ORCHESTRATOR_TASK_QUEUE || process.env.TEMPORAL_TASK_QUEUE || 'workflows',
  algorithmTypescriptTaskQueue: process.env.TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE || 'algorithm-typescript-worker',
  algorithmPythonTaskQueue: process.env.TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE || 'algorithm-python-worker',
}));

export const temporalConfigSchema = {
  TEMPORAL_ADDRESS: Joi.string().optional().description('Temporal server address (host:port)'),
  TEMPORAL_NAMESPACE: Joi.string().optional().default('default').description('Temporal namespace'),
  TEMPORAL_TASK_QUEUE: Joi.string()
    .optional()
    .default('workflows')
    .description('Legacy orchestrator workflow task queue name (alias for TEMPORAL_ORCHESTRATOR_TASK_QUEUE)'),
  TEMPORAL_ORCHESTRATOR_TASK_QUEUE: Joi.string()
    .optional()
    .default('workflows')
    .description('Temporal task queue for orchestrator workflows'),
  TEMPORAL_ALGORITHM_TYPESCRIPT_TASK_QUEUE: Joi.string()
    .optional()
    .default('algorithm-typescript-worker')
    .description('Temporal task queue for TypeScript algorithm workers'),
  TEMPORAL_ALGORITHM_PYTHON_TASK_QUEUE: Joi.string()
    .optional()
    .default('algorithm-python-worker')
    .description('Temporal task queue for Python algorithm workers'),
};
