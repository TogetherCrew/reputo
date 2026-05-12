import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACCESS_ROLE_OWNER,
  type AccessAllowlist,
  type AccessAllowlistWithId,
  MODEL_NAMES,
  type OAuthProvider,
} from '@reputo/database';
import type { Model } from 'mongoose';

@Injectable()
export class AccessAllowlistRepository {
  constructor(
    @InjectModel(MODEL_NAMES.ACCESS_ALLOWLIST)
    private readonly model: Model<AccessAllowlist>,
  ) {}

  async findActiveByEmail(provider: OAuthProvider, email: string): Promise<AccessAllowlistWithId | null> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      return null;
    }

    return (await this.model
      .findOne({
        provider,
        email: normalizedEmail,
        revokedAt: null,
      })
      .lean()
      .exec()) as AccessAllowlistWithId | null;
  }

  async findActiveOwner(provider: OAuthProvider): Promise<AccessAllowlistWithId | null> {
    return (await this.model
      .findOne({
        provider,
        role: ACCESS_ROLE_OWNER,
        revokedAt: null,
      })
      .lean()
      .exec()) as AccessAllowlistWithId | null;
  }

  async createOwner(provider: OAuthProvider, email: string): Promise<AccessAllowlistWithId> {
    const created = await this.model.create({
      provider,
      email: this.normalizeEmail(email),
      role: ACCESS_ROLE_OWNER,
      invitedBy: null,
      invitedAt: new Date(),
    } satisfies AccessAllowlist);

    return created.toObject() as AccessAllowlistWithId;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
