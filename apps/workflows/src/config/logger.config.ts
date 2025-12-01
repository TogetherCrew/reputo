/**
 * Logger configuration for the workflows application.
 *
 * Provides a Pino logger instance with appropriate formatting and log levels.
 */

import pino from 'pino';
import type { AppConfig } from './environment.config.js';

/**
 * Creates a configured Pino logger instance.
 *
 * @param config - Application configuration
 * @returns Configured Pino logger
 */
export function createLogger(config: AppConfig) {
  return pino({
    level: config.logLevel,
    transport:
      config.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    base: {
      env: config.nodeEnv,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
