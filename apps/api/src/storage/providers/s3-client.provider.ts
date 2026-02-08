import { ConfigService } from '@nestjs/config';
import { createS3Client } from '@reputo/storage';

export const S3_CLIENT = Symbol('S3_CLIENT');

export const s3ClientProvider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return createS3Client(
      {
        region: configService.get<string>('aws.region') as string,
        accessKeyId: configService.get<string>('aws.accessKeyId'),
        secretAccessKey: configService.get<string>('aws.secretAccessKey'),
      },
      configService.get<string>('app.nodeEnv') as string,
    );
  },
};
