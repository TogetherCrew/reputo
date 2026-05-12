import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessAllowlistSchema, MODEL_NAMES } from '@reputo/database';
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
    ]),
  ],
  providers: [AccessAllowlistRepository, AccessService, AccessOwnerBootstrap],
  exports: [AccessService],
})
export class AccessModule {}
