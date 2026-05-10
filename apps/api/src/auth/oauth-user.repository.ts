import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { OAuthProvider, OAuthUser, OAuthUserModel, OAuthUserWithId } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';

@Injectable()
export class OAuthUserRepository {
  constructor(
    @InjectModel(MODEL_NAMES.OAUTH_USER)
    private readonly model: OAuthUserModel,
  ) {}

  async upsertBySub(
    provider: OAuthProvider,
    sub: string,
    update: Omit<OAuthUser, 'provider' | 'sub' | 'createdAt' | 'updatedAt'>,
  ): Promise<OAuthUserWithId> {
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
      .exec()) as OAuthUserWithId;
  }

  async findById(id: string): Promise<OAuthUserWithId | null> {
    return (await this.model.findById(id).lean().exec()) as OAuthUserWithId | null;
  }
}
