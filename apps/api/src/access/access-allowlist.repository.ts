import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACCESS_ROLE_ADMIN,
  ACCESS_ROLE_OWNER,
  type AccessAllowlist,
  type AccessAllowlistWithId,
  MODEL_NAMES,
  type OAuthProvider,
} from '@reputo/database';
import type { Model, Types } from 'mongoose';

type FindOneAndUpdateResult<T> = {
  lastErrorObject?: {
    updatedExisting?: boolean;
    upserted?: unknown;
  };
  value: T | null;
};

export type AddAdminAllowlistResult =
  | {
      doc: AccessAllowlistWithId;
      status: 'created' | 'restored';
    }
  | {
      status: 'active';
    };

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

  async findByEmail(provider: OAuthProvider, email: string): Promise<AccessAllowlistWithId | null> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      return null;
    }

    return (await this.model
      .findOne({
        provider,
        email: normalizedEmail,
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

  async addAdmin(
    provider: OAuthProvider,
    email: string,
    actorId: Types.ObjectId | string,
    invitedAt = new Date(),
  ): Promise<AddAdminAllowlistResult> {
    const normalizedEmail = this.normalizeEmail(email);

    try {
      const result = (await this.model
        .findOneAndUpdate(
          {
            provider,
            email: normalizedEmail,
            revokedAt: {
              $exists: true,
              $ne: null,
            },
          },
          {
            $set: {
              role: ACCESS_ROLE_ADMIN,
              invitedBy: actorId,
              invitedAt,
            },
            $unset: {
              revokedAt: '',
              revokedBy: '',
            },
          },
          {
            includeResultMetadata: true,
            lean: true,
            new: true,
            setDefaultsOnInsert: true,
            upsert: true,
          },
        )
        .exec()) as FindOneAndUpdateResult<AccessAllowlistWithId>;

      if (!result.value) {
        throw new Error('Admin allowlist upsert did not return a document.');
      }

      return {
        doc: result.value,
        status: result.lastErrorObject?.updatedExisting ? 'restored' : 'created',
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        return { status: 'active' };
      }

      throw error;
    }
  }

  async softRevoke(
    provider: OAuthProvider,
    email: string,
    actorId: Types.ObjectId | string,
    revokedAt = new Date(),
  ): Promise<AccessAllowlistWithId | null> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail) {
      return null;
    }

    return (await this.model
      .findOneAndUpdate(
        {
          provider,
          email: normalizedEmail,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt,
            revokedBy: actorId,
          },
        },
        {
          lean: true,
          new: true,
        },
      )
      .exec()) as AccessAllowlistWithId | null;
  }

  async listActive(provider: OAuthProvider): Promise<AccessAllowlistWithId[]> {
    return (await this.model
      .find({
        provider,
        revokedAt: null,
      })
      .lean()
      .exec()) as AccessAllowlistWithId[];
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
