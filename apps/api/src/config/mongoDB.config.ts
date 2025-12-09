import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

function buildMongoUri(): string {
  const host = process.env.MONGODB_HOST;
  const port = process.env.MONGODB_PORT;
  const dbName = process.env.MONGODB_DB_NAME;
  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;

  // Build base URI with optional authentication
  const authPart = user && password ? `${user}:${password}@` : '';
  const baseUri = `mongodb://${authPart}${host}:${port}/${dbName}`;

  // Build query params
  const params: string[] = [];
  if (user && password) {
    params.push('authSource=admin');
  }
  // directConnection=true is needed for single-node replica sets
  params.push('directConnection=true');

  return `${baseUri}?${params.join('&')}`;
}

export default registerAs('mongoDB', () => ({
  host: process.env.MONGODB_HOST,
  port: process.env.MONGODB_PORT,
  user: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
  dbName: process.env.MONGODB_DB_NAME,
  uri: buildMongoUri(),
}));

export const mongoDBConfigSchema = {
  MONGODB_HOST: Joi.string().required().description('MongoDB host'),
  MONGODB_PORT: Joi.number().integer().positive().required().description('MongoDB port'),
  MONGODB_USER: Joi.string().optional().description('MongoDB user (optional for local dev)'),
  MONGODB_PASSWORD: Joi.string().optional().description('MongoDB password (optional for local dev)'),
  MONGODB_DB_NAME: Joi.string().required().description('MongoDB db name'),
};
