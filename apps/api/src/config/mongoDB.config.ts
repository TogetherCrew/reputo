import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('mongoDB', () => ({
  host: process.env.MONGODB_HOST,
  port: process.env.MONGODB_PORT,
  user: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
  dbName: process.env.MONGODB_DB_NAME,
  uri: `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}?authSource=admin&replicaSet=rs0`,
}));

export const mongoDBConfigSchema = {
  MONGODB_HOST: Joi.string().required().description('MongoDB host'),
  MONGODB_PORT: Joi.number().integer().positive().required().description('MongoDB port'),
  MONGODB_USER: Joi.string().required().description('MongoDB user'),
  MONGODB_PASSWORD: Joi.string().required().description('MongoDB password'),
  MONGODB_DB_NAME: Joi.string().required().description('MongoDB db name'),
};
