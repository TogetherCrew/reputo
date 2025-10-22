import { Injectable } from '@nestjs/common';
import type { AlgorithmPreset, PaginateOptions, PaginateResult, Snapshot } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import { AlgorithmPresetRepository } from '../algorithm-preset/algorithm-preset.repository';
import { throwInvalidIdError, throwNotFoundError } from '../shared/exceptions';
import type { CreateSnapshotDto, QuerySnapshotDto } from './dto';
import { SnapshotRepository } from './snapshot.repository';

@Injectable()
export class SnapshotService {
  constructor(
    private readonly repository: SnapshotRepository,
    private readonly algorithmPresetRepository: AlgorithmPresetRepository,
  ) {}

  async create(createDto: CreateSnapshotDto): Promise<Snapshot> {
    // Validate algorithmPreset ID format
    if (!isValidObjectId(createDto.algorithmPreset)) {
      throwInvalidIdError(createDto.algorithmPreset, 'AlgorithmPreset');
    }

    // Check if algorithm preset exists
    const preset = await this.algorithmPresetRepository.findById(createDto.algorithmPreset);
    if (!preset) {
      throwNotFoundError(createDto.algorithmPreset, 'AlgorithmPreset');
    }

    return this.repository.create(createDto);
  }

  async findAll(queryDto: QuerySnapshotDto): Promise<PaginateResult<Snapshot>> {
    // Validate algorithmPreset filter ID if provided
    if (queryDto.algorithmPreset && !isValidObjectId(queryDto.algorithmPreset)) {
      throwInvalidIdError(queryDto.algorithmPreset, 'AlgorithmPreset');
    }

    const filter: FilterQuery<Snapshot> = {};

    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    if (queryDto.algorithmPreset) {
      filter.algorithmPreset = queryDto.algorithmPreset;
    }

    // Apply key/version filters (requires lookup in AlgorithmPreset collection)
    if (queryDto.key || queryDto.version) {
      const presetFilter: FilterQuery<AlgorithmPreset> = {};
      if (queryDto.key) {
        presetFilter['spec.key'] = queryDto.key;
      }
      if (queryDto.version) {
        presetFilter['spec.version'] = queryDto.version;
      }

      // Find matching algorithm presets
      const matchingPresets = await this.algorithmPresetRepository.findAll(presetFilter, {
        page: 1,
        limit: 1000, // Large limit to get all matching presets
      });

      // Filter snapshots by matching preset IDs
      // biome-ignore lint/suspicious/noExplicitAny: _id property exists on MongoDB documents but not in TypeScript interface
      const presetIds = matchingPresets.results.map((preset) => (preset as any)._id);
      filter.algorithmPreset = { $in: presetIds };
    }

    const options: PaginateOptions = {
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: queryDto.sortBy,
    };

    return this.repository.findAll(filter, options);
  }

  async findById(id: string): Promise<Snapshot> {
    const snapshot = await this.repository.findById(id);

    if (!snapshot) {
      throwNotFoundError(id, 'Snapshot');
    }

    return snapshot;
  }
}
