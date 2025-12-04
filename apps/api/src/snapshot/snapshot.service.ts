import { Injectable, Logger } from '@nestjs/common';
import type { AlgorithmPresetFrozen, Snapshot } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { AlgorithmPresetRepository } from '../algorithm-preset/algorithm-preset.repository';
import { throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { TemporalService } from '../temporal';
import type { CreateSnapshotDto, ListSnapshotsQueryDto } from './dto';
import { SnapshotRepository } from './snapshot.repository';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    private readonly repository: SnapshotRepository,
    private readonly algorithmPresetRepository: AlgorithmPresetRepository,
    private readonly temporalService: TemporalService,
  ) {}

  async create(createDto: CreateSnapshotDto) {
    const algorithmPreset = await this.algorithmPresetRepository.findById(createDto.algorithmPresetId);
    if (!algorithmPreset) {
      throwNotFoundError(createDto.algorithmPresetId, MODEL_NAMES.ALGORITHM_PRESET);
    }
    const { algorithmPresetId: _, outputs, ...snapshotData } = createDto;

    const snapshot: Omit<Snapshot, 'createdAt' | 'updatedAt'> = {
      status: 'queued',
      ...snapshotData,
      algorithmPreset: createDto.algorithmPresetId,
      algorithmPresetFrozen: algorithmPreset as AlgorithmPresetFrozen,
      outputs: outputs as Record<string, string | undefined> | undefined,
    };

    const createdSnapshot = await this.repository.create(snapshot);

    void this.startWorkflowAsync(createdSnapshot._id.toString());

    return createdSnapshot;
  }

  private async startWorkflowAsync(snapshotId: string): Promise<void> {
    try {
      this.logger.log(`Attempting to start workflow for snapshot ${snapshotId}`);
      await this.temporalService.startRunSnapshotWorkflow(snapshotId);
      this.logger.log(`Successfully initiated workflow start for snapshot ${snapshotId}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to start workflow for snapshot ${snapshotId}: ${err.message}`, err.stack, {
        snapshotId,
        errorName: err.name,
        errorMessage: err.message,
      });
      // Don't throw - snapshot creation should succeed even if workflow start fails
    }
  }

  list(queryDto: ListSnapshotsQueryDto) {
    const filter: FilterQuery<Snapshot> = pick(queryDto, ['status', 'algorithmPreset']);
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
