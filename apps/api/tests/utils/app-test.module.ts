import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AlgorithmPresetModule } from '../../src/algorithm-preset/algorithm-preset.module';
import { configModules } from '../../src/config';
import { SnapshotModule } from '../../src/snapshot/snapshot.module';

export interface TestAppOptions {
  mongoUri: string;
}

export async function createTestApp(options: TestAppOptions) {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: configModules,
        isGlobal: true,
        ignoreEnvFile: true,
      }),
      MongooseModule.forRoot(options.mongoUri),
      AlgorithmPresetModule,
      SnapshotModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Apply global pipes matching production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable versioning with /api/v1 prefix
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  await app.init();

  return { app, moduleRef };
}
