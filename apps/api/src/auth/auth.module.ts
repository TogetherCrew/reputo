import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSessionSchema, DeepIdUserSchema, MODEL_NAMES } from '@reputo/database';
import { SessionAuthGuard } from '../shared/guards';
import { DeepIdAuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionRepository } from './auth-session.repository';
import { DeepIdAuthService } from './deep-id-auth.service';
import { DeepIdOAuthService } from './deep-id-oauth.service';
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
    DeepIdUserRepository,
    SessionAuthGuard,
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
  ],
  exports: [DeepIdAuthService],
})
export class DeepIdAuthModule {}
