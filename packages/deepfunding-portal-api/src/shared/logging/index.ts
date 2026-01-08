import pino from 'pino';

/**
 * Create a shared Pino logger instance with redaction for sensitive headers
 */
export function createLogger(): pino.Logger {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['headers.authententicaion-key', 'headers["authententicaion-key"]'],
      censor: '[REDACTED]',
    },
  });
}
