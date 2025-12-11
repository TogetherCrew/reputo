import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PaginateOptions, Snapshot, SnapshotModel } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { ClientSession, FilterQuery } from 'mongoose';

@Injectable()
export class SnapshotRepository {
  constructor(
    @InjectModel(MODEL_NAMES.SNAPSHOT)
    private readonly model: SnapshotModel,
  ) {}

  create(createData: Omit<Snapshot, 'createdAt' | 'updatedAt'>) {
    return this.model.create(createData);
  }

  findAll(filter: FilterQuery<Snapshot>, options: PaginateOptions) {
    return this.model.paginate(filter, options);
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  find(filter: FilterQuery<Snapshot>) {
    return this.model.find(filter).lean().exec();
  }

  deleteById(id: string, session?: ClientSession) {
    return this.model.findByIdAndDelete(id, { session }).lean().exec();
  }

  async deleteMany(filter: FilterQuery<Snapshot>, session?: ClientSession): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter, { session }).exec();
    return { deletedCount: result.deletedCount };
  }
}
