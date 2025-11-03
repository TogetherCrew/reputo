import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('storage', () => ({
  bucket: process.env.STORAGE_BUCKET,
  presignPutTtl: Number(process.env.STORAGE_PRESIGN_PUT_TTL ?? 120),
  presignGetTtl: Number(process.env.STORAGE_PRESIGN_GET_TTL ?? 300),
  maxSizeBytes: Number(process.env.STORAGE_MAX_SIZE_BYTES ?? 52428800), // 50MB default
  contentTypeAllowlist: process.env.STORAGE_CONTENT_TYPE_ALLOWLIST ?? 'text/csv,text/plain',
}));

export const storageConfigSchema = {
  STORAGE_BUCKET: Joi.string().required().description('S3 bucket name for file storage'),
  STORAGE_PRESIGN_PUT_TTL: Joi.number()
    .integer()
    .positive()
    .default(120)
    .description('Presigned PUT URL TTL in seconds'),
  STORAGE_PRESIGN_GET_TTL: Joi.number()
    .integer()
    .positive()
    .default(300)
    .description('Presigned GET URL TTL in seconds'),
  STORAGE_MAX_SIZE_BYTES: Joi.number()
    .integer()
    .positive()
    .default(52428800)
    .description('Maximum file size in bytes (default 50MB)'),
  STORAGE_CONTENT_TYPE_ALLOWLIST: Joi.string()
    .default('text/csv,text/plain')
    .description('Comma-separated list of allowed MIME types'),
};
