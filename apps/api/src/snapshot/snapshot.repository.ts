import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PaginateOptions, Snapshot, SnapshotModel } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { FilterQuery } from 'mongoose';
import type { CreateSnapshotDto } from './dto';

@Injectable()
export class SnapshotRepository {
  constructor(
    @InjectModel(MODEL_NAMES.SNAPSHOT)
    private readonly model: SnapshotModel,
  ) {}

  create(createDto: CreateSnapshotDto) {
    return this.model.create(createDto);
  }

  findAll(filter: FilterQuery<Snapshot>, options: PaginateOptions) {
    return this.model.paginate(filter, options);
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).lean().exec();
  }
}
