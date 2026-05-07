import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSessionSchema, MODEL_NAMES, OAuthUserSchema } from '@reputo/database';
import { SessionAuthGuard } from '../shared/guards';
import { OAuthProviderClient } from '../shared/oauth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionRepository } from './auth-session.repository';
import { OAuthAuthProviderService } from './oauth-auth-provider.service';
import { OAuthUserRepository } from './oauth-user.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.AUTH_SESSION,
        schema: AuthSessionSchema,
      },
      {
        name: MODEL_NAMES.OAUTH_USER,
        schema: OAuthUserSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthCookieService,
    AuthSessionRepository,
    AuthService,
    OAuthProviderClient,
    OAuthAuthProviderService,
    OAuthUserRepository,
    SessionAuthGuard,
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
