import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('temporal', () => ({
  address: process.env.TEMPORAL_ADDRESS,
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
  orchestratorTaskQueue: process.env.TEMPORAL_ORCHESTRATOR_TASK_QUEUE,
}));

export const temporalConfigSchema = {
  TEMPORAL_ADDRESS: Joi.string().optional().description('Temporal server address (host:port)'),
  TEMPORAL_NAMESPACE: Joi.string().optional().default('default').description('Temporal namespace'),
  TEMPORAL_ORCHESTRATOR_TASK_QUEUE: Joi.string()
    .optional()
    .default('workflows')
    .description('Temporal task queue for orchestrator workflows'),
};
