import { Injectable } from '@nestjs/common';
import type { AlgorithmPresetFrozen, Snapshot, SnapshotWithId } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AlgorithmPresetRepository } from '../algorithm-preset/algorithm-preset.repository';
import { throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { StorageService } from '../storage/storage.service';
import { TemporalService } from '../temporal';
import type { CreateSnapshotDto, ListSnapshotsQueryDto } from './dto';
import { SnapshotRepository } from './snapshot.repository';
@Injectable()
export class SnapshotService {
  constructor(
    @InjectPinoLogger(SnapshotService.name)
    private readonly logger: PinoLogger,
    private readonly repository: SnapshotRepository,
    private readonly algorithmPresetRepository: AlgorithmPresetRepository,
    private readonly temporalService: TemporalService,
    private readonly storageService: StorageService,
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

    this.logger.info({ snapshotId: createdSnapshot._id.toString() }, 'Starting snapshot workflow');
    void this.temporalService.startSnapshotWorkflow(createdSnapshot._id.toString());

    return createdSnapshot;
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
    const snapshot = await this.repository.findById(id);
    if (!snapshot) {
      throwNotFoundError(id, MODEL_NAMES.SNAPSHOT);
    }

    // Step 1: Terminate workflow and wait for it to fully stop
    if (snapshot.status === 'running' && snapshot.temporal?.workflowId) {
      this.logger.info(
        { snapshotId: id, workflowId: snapshot.temporal.workflowId },
        'Terminating running snapshot workflow before delete',
      );
      await this.temporalService.terminateSnapshotWorkflow(
        snapshot.temporal.workflowId,
        true, // Wait for termination to complete
      );
    }

    // Step 2: Delete from database
    await this.repository.deleteById(id);

    // Step 3: Clean up S3 (workflow is now guaranteed to be stopped)
    await this.deleteS3Objects(snapshot);
  }

  private async deleteS3Objects(snapshot: SnapshotWithId): Promise<void> {
    const keysToDelete: string[] = [];

    try {
      if (snapshot.algorithmPresetFrozen?.inputs) {
        for (const input of snapshot.algorithmPresetFrozen.inputs) {
          if (typeof input.value === 'string' && input.value.startsWith('uploads/')) {
            keysToDelete.push(input.value);
          }
        }
      }

      try {
        const prefix = `snapshots/${snapshot._id}/`;
        const snapshotKeys = await this.storageService.listObjectsByPrefix(prefix);
        keysToDelete.push(...snapshotKeys);
        this.logger.info(`Found ${snapshotKeys.length} objects for snapshot ${snapshot._id}`);
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to list S3 objects for snapshot ${snapshot._id}: ${err.message}`, err.stack);
      }

      if (keysToDelete.length > 0) {
        this.logger.info(`Deleting ${keysToDelete.length} S3 objects for snapshot ${snapshot._id}`);

        const result = await this.storageService.deleteObjects(keysToDelete);

        this.logger.info(`Deleted ${result.deleted.length} S3 objects for snapshot ${snapshot._id}`);

        if (result.errors.length > 0) {
          this.logger.warn(`Failed to delete ${result.errors.length} S3 objects for snapshot ${snapshot._id}`, {
            errors: result.errors,
          });
        }
      } else {
        this.logger.info(`No S3 objects to delete for snapshot ${snapshot._id}`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete S3 objects for snapshot ${snapshot._id}: ${err.message}`, err.stack);
    }
  }
}
