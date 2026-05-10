import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MODEL_NAMES, OAuthConsentGrantSchema } from '@reputo/database';
import { OAuthProviderClient } from '../shared/oauth';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';
import { OAuthConsentGrantRepository } from './oauth-consent-grant.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.OAUTH_CONSENT_GRANT,
        schema: OAuthConsentGrantSchema,
      },
    ]),
  ],
  controllers: [ConsentController],
  providers: [ConsentService, OAuthConsentGrantRepository, OAuthProviderClient],
})
export class ConsentModule {}
