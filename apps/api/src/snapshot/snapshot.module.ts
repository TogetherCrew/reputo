import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmPresetSchema, MODEL_NAMES, SnapshotSchema } from '@reputo/database';
import { AlgorithmPresetModule } from '../algorithm-preset/algorithm-preset.module';
import { TemporalModule } from '../temporal';
import { SnapshotController } from './snapshot.controller';
import { SnapshotRepository } from './snapshot.repository';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MODEL_NAMES.SNAPSHOT, schema: SnapshotSchema },
      {
        name: MODEL_NAMES.ALGORITHM_PRESET,
        schema: AlgorithmPresetSchema,
      },
    ]),
    AlgorithmPresetModule,
    TemporalModule,
  ],
  controllers: [SnapshotController],
  providers: [SnapshotRepository, SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
