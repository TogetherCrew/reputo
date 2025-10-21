import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AlgorithmPreset, AlgorithmPresetModel, PaginateOptions, PaginateResult } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import { Model } from 'mongoose';
import type { CreateAlgorithmPresetDto, QueryAlgorithmPresetDto, UpdateAlgorithmPresetDto } from './dto';

/**
 * Repository for AlgorithmPreset database operations.
 * Handles all direct database interactions for algorithm presets.
 */
@Injectable()
export class AlgorithmPresetRepository {
  constructor(
    @InjectModel('AlgorithmPreset')
    private readonly model: Model<AlgorithmPreset> & AlgorithmPresetModel,
  ) {}

  /**
   * Creates a new algorithm preset.
   */
  create(createDto: CreateAlgorithmPresetDto): Promise<AlgorithmPreset> {
    const created = new this.model(createDto);
    return created.save();
  }

  /**
   * Finds all algorithm presets with pagination and filtering.
   */
  findAll(queryDto: QueryAlgorithmPresetDto): Promise<PaginateResult<AlgorithmPreset>> {
    const filter: FilterQuery<AlgorithmPreset> = {};

    // Apply filters
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

    return this.model.paginate(filter, options);
  }

  /**
   * Finds an algorithm preset by ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<AlgorithmPreset | null> {
    return this.model.findById(id).exec();
  }

  /**
   * Updates an algorithm preset by ID.
   * Returns null if not found.
   */
  update(id: string, updateDto: UpdateAlgorithmPresetDto): Promise<AlgorithmPreset | null> {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  /**
   * Deletes an algorithm preset by ID.
   * Returns null if not found.
   */
  remove(id: string): Promise<AlgorithmPreset | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
