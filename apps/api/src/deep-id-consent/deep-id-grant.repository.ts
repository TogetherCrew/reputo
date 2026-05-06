import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DeepIdGrant, DeepIdGrantModel, DeepIdGrantWithId } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';

@Injectable()
export class DeepIdGrantRepository {
  constructor(
    @InjectModel(MODEL_NAMES.DEEP_ID_GRANT)
    private readonly model: DeepIdGrantModel,
  ) {}

  async create(data: Omit<DeepIdGrant, 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.model.create(data);
  }

  async findActiveByState(state: string): Promise<DeepIdGrantWithId | null> {
    return (await this.model
      .findOne({
        state,
        expiresAt: { $gt: new Date() },
      })
      .select('+codeVerifier')
      .lean()
      .exec()) as DeepIdGrantWithId | null;
  }

  async deleteByState(state: string): Promise<boolean> {
    const result = await this.model.deleteOne({ state }).exec();
    return result.deletedCount > 0;
  }
}
