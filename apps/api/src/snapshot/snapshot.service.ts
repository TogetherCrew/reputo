import { Injectable } from '@nestjs/common';
import type { AlgorithmPreset, AlgorithmPresetFrozen, Snapshot } from '@reputo/database';
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
    const algorithmPreset = await this.algorithmPresetRepository.findById(createDto.algorithmPresetId);
    if (!algorithmPreset) {
      throwNotFoundError(createDto.algorithmPresetId, MODEL_NAMES.ALGORITHM_PRESET);
    }
    const { algorithmPresetId: _, ...snapshotData } = createDto;

    const snapshot: Omit<Snapshot, 'createdAt' | 'updatedAt'> = {
      status: 'queued',
      ...snapshotData,
      algorithmPresetFrozen: algorithmPreset as AlgorithmPresetFrozen,
    };

    return this.repository.create(snapshot);
  }

  list(queryDto: ListSnapshotsQueryDto) {
    const filter: FilterQuery<Snapshot> = pick(queryDto, ['status']);
    const paginateOptions = pick(queryDto, ['page', 'limit', 'sortBy', 'populate']);

    const presetFilters: Record<string, string> = {};
    if (queryDto.key) presetFilters['algorithmPresetFrozen.key'] = queryDto.key;
    if (queryDto.version) presetFilters['algorithmPresetFrozen.version'] = queryDto.version;

    Object.assign(filter, presetFilters);

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
