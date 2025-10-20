import { ConfigService } from '@nestjs/config';
export const pinoConfig = (configService: ConfigService) => {
  const nodeEnv = configService.get('app.nodeEnv');
  const logLevel = configService.get('logger.level');
  return {
    pinoHttp: {
      level: logLevel,
      transport:
        nodeEnv !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            }
          : undefined,
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    },
  };
};
