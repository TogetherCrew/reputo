import { Injectable } from '@nestjs/common';
import type { AlgorithmPreset, Snapshot } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { AlgorithmPresetRepository } from '../algorithm-preset/algorithm-preset.repository';
import { throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import type { CreateSnapshotDto, ListSnapshotsQueryDto } from './dto';
import { SnapshotRepository } from './snapshot.repository';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly repository: SnapshotRepository,
    private readonly algorithmPresetRepository: AlgorithmPresetRepository,
  ) {}

  async create(createDto: CreateSnapshotDto) {
    const algorithmPreset = await this.algorithmPresetRepository.findById(createDto.algorithmPreset);
    if (!algorithmPreset) {
      throwNotFoundError(createDto.algorithmPreset, SnapshotService.name);
    }

    return this.repository.create(createDto);
  }

  async list(queryDto: ListSnapshotsQueryDto) {
    const filter: FilterQuery<Snapshot> = pick(queryDto, ['status', 'algorithmPreset']);
    const paginateOptions = pick(queryDto, ['page', 'limit', 'sortBy', 'populate']);

    if (queryDto.key || queryDto.version) {
      const algorithmPresetFilter: FilterQuery<AlgorithmPreset> = {};
      if (queryDto.key) algorithmPresetFilter.key = queryDto.key;
      if (queryDto.version) algorithmPresetFilter.version = queryDto.version;

      const algorithmPresets = await this.algorithmPresetRepository.findAll(algorithmPresetFilter, {
        page: 1,
        limit: 1000,
      });

      const algorithmPresetIds = algorithmPresets.results.map((algorithmPreset) => algorithmPreset._id);
      filter.algorithmPreset = { $in: algorithmPresetIds };
    }
    return this.repository.findAll(filter, paginateOptions);
  }

  async getById(id: string) {
    const snapshot = await this.repository.findById(id);
    if (!snapshot) {
      throwNotFoundError(id, MODEL_NAMES.SNAPSHOT);
    }
    return snapshot;
  }

  async deleteById(id: string) {
    const result = await this.repository.deleteById(id);
    if (!result) {
      throwNotFoundError(id, MODEL_NAMES.SNAPSHOT);
    }
  }
}
