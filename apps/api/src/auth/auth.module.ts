import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSessionSchema, DeepIdUserSchema, MODEL_NAMES } from '@reputo/database';
import { DeepIdAuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionRepository } from './auth-session.repository';
import { DeepIdAuthService } from './deep-id-auth.service';
import { DeepIdOAuthService } from './deep-id-oauth.service';
import { DeepIdTokenValidationService } from './deep-id-token-validation.service';
import { DeepIdUserRepository } from './deep-id-user.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.AUTH_SESSION,
        schema: AuthSessionSchema,
      },
      {
        name: MODEL_NAMES.DEEP_ID_USER,
        schema: DeepIdUserSchema,
      },
    ]),
  ],
  controllers: [DeepIdAuthController],
  providers: [
    AuthCookieService,
    AuthSessionRepository,
    DeepIdAuthService,
    DeepIdOAuthService,
    DeepIdTokenValidationService,
    DeepIdUserRepository,
  ],
  exports: [DeepIdAuthService],
})
export class DeepIdAuthModule {}
