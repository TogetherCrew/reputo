import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessAllowlistSchema, AuthSessionSchema, MODEL_NAMES, OAuthUserSchema } from '@reputo/database';
import { AuthSessionRepository } from '../auth/auth-session.repository';
import { OAuthUserRepository } from '../auth/oauth-user.repository';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessAllowlistRepository } from './access-allowlist.repository';
import { AccessOwnerBootstrap } from './access-owner.bootstrap';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.ACCESS_ALLOWLIST,
        schema: AccessAllowlistSchema,
      },
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
  controllers: [AccessController],
  providers: [
    AccessAllowlistRepository,
    AccessService,
    AccessOwnerBootstrap,
    AuthSessionRepository,
    OAuthUserRepository,
    RolesGuard,
  ],
  exports: [AccessService],
})
export class AccessModule {}
