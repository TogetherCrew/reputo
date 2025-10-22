import { BadRequestException, Injectable } from '@nestjs/common';
import type { AlgorithmPreset, PaginateOptions, PaginateResult } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { throwNotFoundError } from '../shared/exceptions';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, QueryAlgorithmPresetDto, UpdateAlgorithmPresetDto } from './dto';

@Injectable()
export class AlgorithmPresetService {
  constructor(private readonly repository: AlgorithmPresetRepository) {}

  create(createDto: CreateAlgorithmPresetDto): Promise<AlgorithmPreset> {
    return this.repository.create(createDto);
  }

  findAll(queryDto: QueryAlgorithmPresetDto): Promise<PaginateResult<AlgorithmPreset>> {
    const filter: FilterQuery<AlgorithmPreset> = {};

    if (queryDto.key) {
      filter['spec.key'] = queryDto.key;
    }
    if (queryDto.version) {
      filter['spec.version'] = queryDto.version;
    }

    const options: PaginateOptions = {
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: queryDto.sortBy,
    };

    return this.repository.findAll(filter, options);
  }

  async findById(id: string): Promise<AlgorithmPreset> {
    const preset = await this.repository.findById(id);
    if (!preset) {
      throwNotFoundError(id, 'AlgorithmPreset');
    }

    return preset;
  }

  async update(id: string, updateDto: UpdateAlgorithmPresetDto): Promise<AlgorithmPreset> {
    // Explicitly reject attempts to update immutable spec fields
    if ('spec' in updateDto) {
      throw new BadRequestException('Cannot update immutable spec fields (key, version)');
    }

    const updated = await this.repository.updateById(id, updateDto);

    if (!updated) {
      throwNotFoundError(id, 'AlgorithmPreset');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.deleteById(id);
    if (!result) {
      throwNotFoundError(id, 'AlgorithmPreset');
    }
  }
}
