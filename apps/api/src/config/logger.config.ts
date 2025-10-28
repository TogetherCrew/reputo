import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'info',
}));

export const loggerConfigSchema = {
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info')
    .description('Log level'),
};
