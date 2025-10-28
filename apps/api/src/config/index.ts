import * as Joi from 'joi';
import appConfig, { appConfigSchema } from './app.config';
import loggerConfig, { loggerConfigSchema } from './logger.config';
import mongoDBConfig, { mongoDBConfigSchema } from './mongoDB.config';

export const configModules = [appConfig, loggerConfig, mongoDBConfig];

export const configValidationSchema = Joi.object({
  ...appConfigSchema,
  ...loggerConfigSchema,
  ...mongoDBConfigSchema,
});
