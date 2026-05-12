import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AuthSession, AuthSessionModel, AuthSessionWithId } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { Types } from 'mongoose';

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectModel(MODEL_NAMES.AUTH_SESSION)
    private readonly model: AuthSessionModel,
  ) {}

  async create(data: Omit<AuthSession, 'createdAt' | 'updatedAt'>): Promise<AuthSessionWithId> {
    const created = await this.model.create(data);
    return created.toObject() as AuthSessionWithId;
  }

  async findActiveBySessionId(sessionId: string, includeSecrets = false): Promise<AuthSessionWithId | null> {
    const query = this.model.findOne({
      sessionId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (includeSecrets) {
      query.select('+accessTokenCiphertext +refreshTokenCiphertext');
    }

    return (await query.lean().exec()) as AuthSessionWithId | null;
  }

  async updateAfterRefresh(
    sessionId: string,
    update: Partial<
      Pick<
        AuthSession,
        | 'accessTokenCiphertext'
        | 'refreshTokenCiphertext'
        | 'accessTokenExpiresAt'
        | 'refreshTokenExpiresAt'
        | 'scope'
        | 'lastRefreshedAt'
        | 'expiresAt'
      >
    >,
  ): Promise<AuthSessionWithId | null> {
    return (await this.model
      .findOneAndUpdate(
        {
          sessionId,
          revokedAt: { $exists: false },
          expiresAt: { $gt: new Date() },
        },
        update,
        { new: true },
      )
      .lean()
      .exec()) as AuthSessionWithId | null;
  }

  async revokeBySessionId(sessionId: string, revokedAt = new Date()): Promise<void> {
    await this.model
      .findOneAndUpdate(
        { sessionId, revokedAt: { $exists: false } },
        {
          revokedAt,
          expiresAt: revokedAt,
        },
        { new: false },
      )
      .exec();
  }

  async revokeAllByUserId(userId: Types.ObjectId | string, revokedAt = new Date()): Promise<number> {
    const result = await this.model
      .updateMany(
        {
          userId,
          revokedAt: { $exists: false },
          expiresAt: { $gt: revokedAt },
        },
        {
          $set: {
            revokedAt,
            expiresAt: revokedAt,
          },
        },
      )
      .exec();

    return result.modifiedCount;
  }
}
