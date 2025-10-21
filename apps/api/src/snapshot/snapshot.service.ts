import { Injectable } from '@nestjs/common';
import type { PaginateResult, Snapshot } from '@reputo/database';
import { isValidObjectId } from 'mongoose';
import { AlgorithmPresetRepository } from '../algorithm-preset/algorithm-preset.repository';
import { throwInvalidIdError, throwNotFoundError } from '../shared/exceptions';
import type { CreateSnapshotDto, QuerySnapshotDto } from './dto';
import { SnapshotRepository } from './snapshot.repository';

/**
 * Service for Snapshot business logic.
 * Handles validation and orchestrates repository operations.
 */
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

  findAll(queryDto: QuerySnapshotDto): Promise<PaginateResult<Snapshot>> {
    // Validate algorithmPreset filter ID if provided
    if (queryDto.algorithmPreset && !isValidObjectId(queryDto.algorithmPreset)) {
      throwInvalidIdError(queryDto.algorithmPreset, 'AlgorithmPreset');
    }

    return this.repository.findAll(queryDto);
  }

  async findById(id: string): Promise<Snapshot> {
    const snapshot = await this.repository.findById(id);

    if (!snapshot) {
      throwNotFoundError(id, 'Snapshot');
    }

    return snapshot;
  }
}
