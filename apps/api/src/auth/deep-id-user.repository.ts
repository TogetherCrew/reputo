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

  async upsertBySub(
    provider: DeepIdProvider,
    sub: string,
    update: Omit<DeepIdUser, 'provider' | 'sub' | 'createdAt' | 'updatedAt'>,
  ): Promise<DeepIdUserWithId> {
    const definedEntries = Object.entries(update).filter(([, value]) => value !== undefined);
    const unsetEntries = Object.entries(update).filter(([, value]) => value === undefined);

    return (await this.model
      .findOneAndUpdate(
        { provider, sub },
        {
          $set: {
            provider,
            sub,
            ...Object.fromEntries(definedEntries),
          },
          ...(unsetEntries.length > 0 ? { $unset: Object.fromEntries(unsetEntries.map(([key]) => [key, ''])) } : {}),
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
