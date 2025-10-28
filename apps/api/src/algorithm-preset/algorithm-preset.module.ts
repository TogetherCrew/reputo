import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlgorithmPresetSchema, MODEL_NAMES } from '@reputo/database';
import { AlgorithmPresetController } from './algorithm-preset.controller';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import { AlgorithmPresetService } from './algorithm-preset.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MODEL_NAMES.ALGORITHM_PRESET,
        schema: AlgorithmPresetSchema,
      },
    ]),
  ],
  controllers: [AlgorithmPresetController],
  providers: [AlgorithmPresetRepository, AlgorithmPresetService],
  exports: [AlgorithmPresetService, AlgorithmPresetRepository],
})
export class AlgorithmPresetModule {}
