import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { AlgorithmPresetModule } from '../../src/algorithm-preset/algorithm-preset.module';
import { configModules } from '../../src/config';
import { SnapshotModule } from '../../src/snapshot/snapshot.module';
import { StorageService } from '../../src/storage/storage.service';
import { TemporalService } from '../../src/temporal';

export interface TestAppOptions {
  mongoUri: string;
}

export async function createTestApp(options: TestAppOptions) {
  const mockStorageService = {
    getObjectMetadata: async () => ({
      filename: 'votes.csv',
      ext: 'csv',
      size: 128,
      contentType: 'text/csv',
      timestamp: Date.now(),
    }),
    getObject: async () =>
      Buffer.from('answer,question_id,collection_id\n10,question-1,user-1\nskip,question-2,user-2\n'),
    listObjectsByPrefix: async () => [],
    deleteObjects: async () => ({
      deleted: [],
      errors: [],
    }),
  };

  const mockTemporalService = {
    startSnapshotWorkflow: async () => undefined,
    cancelSnapshotWorkflow: async () => undefined,
    terminateSnapshotWorkflow: async () => undefined,
    cancelSnapshotWorkflows: async () => undefined,
    terminateSnapshotWorkflows: async () => undefined,
  };

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: configModules,
        isGlobal: true,
        ignoreEnvFile: true,
      }),
      LoggerModule.forRoot({
        pinoHttp: {
          level: 'silent',
        },
      }),
      MongooseModule.forRoot(options.mongoUri),
      AlgorithmPresetModule,
      SnapshotModule,
    ],
  })
    .overrideProvider(StorageService)
    .useValue(mockStorageService)
    .overrideProvider(TemporalService)
    .useValue(mockTemporalService)
    .compile();

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
