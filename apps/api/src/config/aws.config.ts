import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}));

export const awsConfigSchema = {
  AWS_REGION: Joi.string().required().description('AWS region for S3 bucket'),
  AWS_ACCESS_KEY_ID: Joi.string()
    .optional()
    .description('AWS access key ID (required for non-production environments)'),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .optional()
    .description('AWS secret access key (required for non-production environments)'),
};
