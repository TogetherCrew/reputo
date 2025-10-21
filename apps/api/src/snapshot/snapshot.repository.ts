import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  AlgorithmPreset,
  AlgorithmPresetModel,
  PaginateOptions,
  PaginateResult,
  Snapshot,
  SnapshotModel,
} from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { Model } from 'mongoose';
import type { CreateSnapshotDto, QuerySnapshotDto } from './dto';

/**
 * Repository for Snapshot database operations.
 * Handles all direct database interactions for snapshots.
 */
@Injectable()
export class SnapshotRepository {
  constructor(
    @InjectModel('Snapshot')
    private readonly model: Model<Snapshot> & SnapshotModel,
    @InjectModel('AlgorithmPreset')
    private readonly algorithmPresetModel: Model<AlgorithmPreset> & AlgorithmPresetModel,
  ) {}

  /**
   * Creates a new snapshot.
   */
  create(createDto: CreateSnapshotDto): Promise<Snapshot> {
    const created = new this.model(createDto);
    return created.save();
  }

  /**
   * Finds all snapshots with pagination and filtering.
   */
  async findAll(queryDto: QuerySnapshotDto): Promise<PaginateResult<Snapshot>> {
    const filter: FilterQuery<Snapshot> = {};

    // Apply status filter
    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    // Apply algorithmPreset filter (direct ID)
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
      const matchingPresets = await this.algorithmPresetModel.find(presetFilter).select('_id').exec();

      // Filter snapshots by matching preset IDs
      const presetIds = matchingPresets.map((preset) => preset._id);
      filter.algorithmPreset = { $in: presetIds };
    }

    const options: PaginateOptions = {
      page: queryDto.page,
      limit: queryDto.limit,
      sortBy: queryDto.sortBy,
    };

    return this.model.paginate(filter, options);
  }

  /**
   * Finds a snapshot by ID with algorithmPreset populated.
   * Returns null if not found.
   */
  findById(id: string): Promise<Snapshot | null> {
    return this.model.findById(id).populate('algorithmPreset').exec();
  }
}
