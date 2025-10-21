import { BadRequestException, Injectable } from '@nestjs/common';
import type { AlgorithmPreset, PaginateResult } from '@reputo/database';
import { throwNotFoundError } from '../shared/exceptions';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, QueryAlgorithmPresetDto, UpdateAlgorithmPresetDto } from './dto';

/**
 * Service for AlgorithmPreset business logic.
 * Handles validation and orchestrates repository operations.
 */
@Injectable()
export class AlgorithmPresetService {
  constructor(private readonly repository: AlgorithmPresetRepository) {}

  create(createDto: CreateAlgorithmPresetDto): Promise<AlgorithmPreset> {
    return this.repository.create(createDto);
  }

  findAll(queryDto: QueryAlgorithmPresetDto): Promise<PaginateResult<AlgorithmPreset>> {
    return this.repository.findAll(queryDto);
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

    const updated = await this.repository.update(id, updateDto);

    if (!updated) {
      throwNotFoundError(id, 'AlgorithmPreset');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.remove(id);
    if (!result) {
      throwNotFoundError(id, 'AlgorithmPreset');
    }
  }
}
