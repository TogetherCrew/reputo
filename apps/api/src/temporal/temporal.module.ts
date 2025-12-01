import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemporalService } from './temporal.service';

@Module({
  imports: [ConfigModule],
  providers: [TemporalService],
  exports: [TemporalService],
})
export class TemporalModule {}
