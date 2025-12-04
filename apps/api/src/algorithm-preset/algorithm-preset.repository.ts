import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AlgorithmPreset, AlgorithmPresetModel, PaginateOptions } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import type { CreateAlgorithmPresetDto, UpdateAlgorithmPresetDto } from './dto';

@Injectable()
export class AlgorithmPresetRepository {
  constructor(
    @InjectModel(MODEL_NAMES.ALGORITHM_PRESET)
    private readonly model: AlgorithmPresetModel,
  ) {}

  create(createDto: CreateAlgorithmPresetDto) {
    return this.model.create(createDto);
  }

  findAll(filter: FilterQuery<AlgorithmPreset>, options: PaginateOptions) {
    return this.model.paginate(filter, options);
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  updateById(id: string, updateDto: UpdateAlgorithmPresetDto) {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).lean().exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).lean().exec();
  }
}
