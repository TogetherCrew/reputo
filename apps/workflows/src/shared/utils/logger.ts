import pino from 'pino';
import config from '../../config/index.js';

export const logger = pino({
  level: config.logger.level,
  transport:
    config.app.nodeEnv !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        }
      : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: true,
});
