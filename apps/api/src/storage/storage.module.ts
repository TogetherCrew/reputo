import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { s3ClientProvider } from './providers';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [s3ClientProvider, StorageService],
  exports: [s3ClientProvider.provide, StorageService],
})
export class StorageModule {}
