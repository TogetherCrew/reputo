import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DeepIdProvider, DeepIdUser, DeepIdUserModel, DeepIdUserWithId } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';

@Injectable()
export class DeepIdUserRepository {
  constructor(
    @InjectModel(MODEL_NAMES.DEEP_ID_USER)
    private readonly model: DeepIdUserModel,
  ) {}

  async upsertByDid(
    provider: DeepIdProvider,
    did: string,
    update: Omit<DeepIdUser, 'provider' | 'did' | 'createdAt' | 'updatedAt'>,
  ): Promise<DeepIdUserWithId> {
    return (await this.model
      .findOneAndUpdate(
        { provider, did },
        {
          $set: {
            ...update,
            provider,
            did,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean()
      .exec()) as DeepIdUserWithId;
  }

  async findById(id: string): Promise<DeepIdUserWithId | null> {
    return (await this.model.findById(id).lean().exec()) as DeepIdUserWithId | null;
  }
}
