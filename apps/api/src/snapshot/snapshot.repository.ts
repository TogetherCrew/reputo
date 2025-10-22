import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  AlgorithmPreset,
  AlgorithmPresetModel,
  PaginateOptions,
  PaginateResult,
  Snapshot,
  SnapshotDoc,
  SnapshotModel,
} from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import type { CreateSnapshotDto } from './dto';

@Injectable()
export class SnapshotRepository {
  constructor(
    @InjectModel(MODEL_NAMES.SNAPSHOT)
    private readonly model: SnapshotModel,
  ) {}

  create(createDto: CreateSnapshotDto): Promise<SnapshotDoc> {
    return this.model.create(createDto);
  }

  findAll(filter: FilterQuery<Snapshot>, options: PaginateOptions): Promise<PaginateResult<Snapshot>> {
    return this.model.paginate(filter, options);
  }

  findById(id: string): Promise<Snapshot | null> {
    return this.model.findById(id).lean().exec();
  }
}
