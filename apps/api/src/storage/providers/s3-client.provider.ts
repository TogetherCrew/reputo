import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const S3_CLIENT = Symbol('S3_CLIENT');

export const s3ClientProvider = {
  provide: S3_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const region = configService.get<string>('aws.region');
    const nodeEnv = configService.get<string>('app.nodeEnv');
    const accessKeyId = configService.get<string>('aws.accessKeyId');
    const secretAccessKey = configService.get<string>('aws.secretAccessKey');

    const config: ConstructorParameters<typeof S3Client>[0] = {
      region,
    };

    if (nodeEnv !== 'production' && accessKeyId && secretAccessKey) {
      config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    return new S3Client(config);
  },
};
