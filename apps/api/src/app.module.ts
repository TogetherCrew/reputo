import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { configModules, configValidationSchema } from './config';
import { pinoConfig } from './config/pino.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configModules,
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: pinoConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
