import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  OAuthConsentGrant,
  OAuthConsentGrantModel,
  OAuthConsentGrantWithId,
  OAuthProvider,
} from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';

@Injectable()
export class OAuthConsentGrantRepository {
  constructor(
    @InjectModel(MODEL_NAMES.OAUTH_CONSENT_GRANT)
    private readonly model: OAuthConsentGrantModel,
  ) {}

  async create(data: Omit<OAuthConsentGrant, 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.model.create(data);
  }

  async findActiveByProviderAndState(provider: OAuthProvider, state: string): Promise<OAuthConsentGrantWithId | null> {
    return (await this.model
      .findOne({
        provider,
        state,
        expiresAt: { $gt: new Date() },
      })
      .select('+codeVerifier')
      .lean()
      .exec()) as OAuthConsentGrantWithId | null;
  }

  async deleteByProviderAndState(provider: OAuthProvider, state: string): Promise<boolean> {
    const result = await this.model.deleteOne({ provider, state }).exec();
    return result.deletedCount > 0;
  }
}
