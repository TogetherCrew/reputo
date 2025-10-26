import { Injectable } from '@nestjs/common';
import type { AlgorithmPreset } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import type { FilterQuery } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, ListAlgorithmPresetsQueryDto, UpdateAlgorithmPresetDto } from './dto';
@Injectable()
export class AlgorithmPresetService {
  constructor(
    private readonly repository: AlgorithmPresetRepository,
    @InjectPinoLogger(AlgorithmPresetService.name)
    private readonly logger: PinoLogger,
  ) {}

  create(createDto: CreateAlgorithmPresetDto) {
    // const algorithmDefinition = getAlgorithmDefinition({
    //     key: createDto.key,
    //     version: createDto.version,
    // })
    // console.log(algorithmDefinition)
    return this.repository.create(createDto);
  }

  list(queryDto: ListAlgorithmPresetsQueryDto) {
    const filter: FilterQuery<AlgorithmPreset> = pick(queryDto, ['key', 'version']);
    const paginateOptions = pick(queryDto, ['page', 'limit', 'sortBy']);

    this.logger.info({ filter, paginateOptions }, 'Listing algorithm presets');
    return this.repository.findAll(filter, paginateOptions);
  }

  async getById(id: string) {
    const algorithmPreset = await this.repository.findById(id);

    if (!algorithmPreset) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
    return algorithmPreset;
  }

  async updateById(id: string, updateDto: UpdateAlgorithmPresetDto) {
    const updatedAlgorithmPreset = await this.repository.updateById(id, updateDto);
    if (!updatedAlgorithmPreset) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
    return updatedAlgorithmPreset;
  }

  async deleteById(id: string) {
    const result = await this.repository.deleteById(id);
    if (!result) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
  }
}
