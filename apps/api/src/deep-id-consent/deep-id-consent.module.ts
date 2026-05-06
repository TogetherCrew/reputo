import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DeepIdGrantSchema, MODEL_NAMES } from '@reputo/database';
import { DeepIdOAuthClient } from '../shared/deep-id';
import { DeepIdConsentController } from './deep-id-consent.controller';
import { DeepIdConsentService } from './deep-id-consent.service';
import { DeepIdGrantRepository } from './deep-id-grant.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.DEEP_ID_GRANT,
        schema: DeepIdGrantSchema,
      },
    ]),
  ],
  controllers: [DeepIdConsentController],
  providers: [DeepIdConsentService, DeepIdGrantRepository, DeepIdOAuthClient],
})
export class DeepIdConsentModule {}
