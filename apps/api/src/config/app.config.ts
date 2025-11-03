import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT ?? 3000),
}));

export const appConfigSchema = {
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required().description('Application environment'),
  PORT: Joi.number().integer().positive().default(3000).description('Application port'),
};
