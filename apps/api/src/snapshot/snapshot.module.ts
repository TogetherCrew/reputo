import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmPresetSchema, MODEL_NAMES, SnapshotSchema } from '@reputo/database';
import { AlgorithmPresetModule } from '../algorithm-preset/algorithm-preset.module';
import { SnapshotController } from './snapshot.controller';
import { SnapshotRepository } from './snapshot.repository';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Snapshot', schema: SnapshotSchema },
      {
        name: MODEL_NAMES.ALGORITHM_PRESET,
        schema: AlgorithmPresetSchema,
      },
    ]),
    AlgorithmPresetModule,
  ],
  controllers: [SnapshotController],
  providers: [SnapshotRepository, SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
