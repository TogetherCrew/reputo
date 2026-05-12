import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import type { AccessAllowlist, AuthSession, OAuthUser } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { Model, Types } from 'mongoose';
import supertest from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { encryptValue } from '../../../src/shared/utils';
import { createTestApp } from '../../utils/app-test.module';
import { AUTH_TEST_ENV, createAuthenticatedSession } from '../../utils/auth-session';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { api, base } from '../../utils/request';

describe('Admin access management e2e', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let accessAllowlistModel: Model<AccessAllowlist>;
  let authSessionModel: Model<AuthSession>;
  let oauthUserModel: Model<OAuthUser>;

  beforeAll(async () => {
    const mongoUri = await startMongo();
    const boot = await createTestApp({
      mongoUri,
    });

    app = boot.app;
    moduleRef = boot.moduleRef;
    accessAllowlistModel = moduleRef.get(getModelToken(MODEL_NAMES.ACCESS_ALLOWLIST));
    authSessionModel = moduleRef.get(getModelToken(MODEL_NAMES.AUTH_SESSION));
    oauthUserModel = moduleRef.get(getModelToken(MODEL_NAMES.OAUTH_USER));
  });

  beforeEach(async () => {
    await Promise.all([
      accessAllowlistModel.deleteMany({}),
      authSessionModel.deleteMany({}),
      oauthUserModel.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  async function createSession(email: string, role: 'admin' | 'owner' = 'admin') {
    return createAuthenticatedSession(moduleRef, { email, role });
  }

  async function createExtraSessionForUser(userId: string | Types.ObjectId): Promise<string> {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await authSessionModel.create({
      sessionId,
      provider: 'deep-id',
      userId,
      accessTokenCiphertext: encryptValue(AUTH_TEST_ENV.AUTH_TOKEN_ENCRYPTION_KEY, 'provider-access-token'),
      refreshTokenCiphertext: encryptValue(AUTH_TEST_ENV.AUTH_TOKEN_ENCRYPTION_KEY, 'provider-refresh-token'),
      accessTokenExpiresAt: expiresAt,
      refreshTokenExpiresAt: expiresAt,
      scope: ['openid', 'profile', 'email', 'offline_access'],
      state: `state-${sessionId}`,
      codeVerifier: `verifier-${sessionId}`,
      expiresAt,
    });

    return sessionId;
  }

  it('lists active access rows for an admin with owner first and admins sorted by email', async () => {
    await createSession('owner@example.com', 'owner');
    await createSession('z-admin@example.com');
    const admin = await createSession('m-admin@example.com');
    await createSession('a-admin@example.com');

    const response = await api(app, admin.cookie).get('/admins').expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ email: 'owner@example.com', role: 'owner' }),
      expect.objectContaining({ email: 'a-admin@example.com', role: 'admin' }),
      expect.objectContaining({ email: 'm-admin@example.com', role: 'admin' }),
      expect.objectContaining({ email: 'z-admin@example.com', role: 'admin' }),
    ]);
    expect(response.body[0]).not.toHaveProperty('_id');
    expect(response.body[0]).not.toHaveProperty('invitedBy');
  });

  it('rejects admin callers from adding admins', async () => {
    const admin = await createSession('admin@example.com');

    await api(app, admin.cookie).post('/admins').send({ email: 'new-admin@example.com' }).expect(403);
  });

  it('creates a new admin allowlist row as owner', async () => {
    const owner = await createSession('owner@example.com', 'owner');

    const response = await api(app, owner.cookie)
      .post('/admins')
      .send({ email: ' New.Admin@Example.COM ' })
      .expect(201);

    expect(response.body).toMatchObject({
      email: 'new.admin@example.com',
      role: 'admin',
      invitedByEmail: 'owner@example.com',
    });
    expect(response.body).not.toHaveProperty('_id');

    const row = await accessAllowlistModel.findOne({ email: 'new.admin@example.com' }).lean();

    expect(row).toMatchObject({
      provider: 'deep-id',
      email: 'new.admin@example.com',
      role: 'admin',
    });
    expect(String(row?.invitedBy)).toBe(owner.userId);
    expect(row?.revokedAt).toBeUndefined();
  });

  it('restores a previously revoked admin allowlist row as owner', async () => {
    const owner = await createSession('owner@example.com', 'owner');
    const oldInvitedAt = new Date('2026-01-01T00:00:00.000Z');

    await accessAllowlistModel.create({
      provider: 'deep-id',
      email: 'restore@example.com',
      role: 'admin',
      invitedBy: null,
      invitedAt: oldInvitedAt,
      revokedAt: new Date('2026-02-01T00:00:00.000Z'),
      revokedBy: owner.userId,
    });

    const response = await api(app, owner.cookie).post('/admins').send({ email: 'RESTORE@example.com' }).expect(200);

    expect(response.body).toMatchObject({
      email: 'restore@example.com',
      role: 'admin',
      invitedByEmail: 'owner@example.com',
    });

    const row = await accessAllowlistModel.findOne({ email: 'restore@example.com' }).lean();

    expect(row?.revokedAt).toBeUndefined();
    expect(row?.revokedBy).toBeUndefined();
    expect(String(row?.invitedBy)).toBe(owner.userId);
    expect(row?.invitedAt?.getTime()).toBeGreaterThan(oldInvitedAt.getTime());
  });

  it('returns 409 when adding an already active row', async () => {
    const owner = await createSession('owner@example.com', 'owner');
    await createSession('active@example.com');

    await api(app, owner.cookie).post('/admins').send({ email: 'active@example.com' }).expect(409);
  });

  it('returns 400 when adding a malformed email', async () => {
    const owner = await createSession('owner@example.com', 'owner');

    await api(app, owner.cookie).post('/admins').send({ email: 'not-an-email' }).expect(400);
  });

  it('soft-revokes an admin and revokes all active sessions for that admin user', async () => {
    const owner = await createSession('owner@example.com', 'owner');
    const admin = await createSession('target@example.com');
    await createExtraSessionForUser(admin.userId);

    await api(app, owner.cookie)
      .delete(`/admins/${encodeURIComponent('target@example.com')}`)
      .expect(204);

    const row = await accessAllowlistModel.findOne({ email: 'target@example.com' }).lean();
    const sessions = await authSessionModel.find({ userId: admin.userId }).lean();

    expect(row?.revokedAt).toBeTruthy();
    expect(String(row?.revokedBy)).toBe(owner.userId);
    expect(sessions).toHaveLength(2);
    expect(sessions.every((session) => session.revokedAt)).toBe(true);

    await supertest(app.getHttpServer()).get(base('/auth/me')).set('Cookie', admin.cookie).expect(401);
  });

  it('rejects owner self-removal', async () => {
    const owner = await createSession('owner@example.com', 'owner');

    await api(app, owner.cookie)
      .delete(`/admins/${encodeURIComponent('owner@example.com')}`)
      .expect(403);

    const row = await accessAllowlistModel.findOne({ email: 'owner@example.com' }).lean();

    expect(row?.revokedAt).toBeUndefined();
  });

  it('rejects admin callers from removing admins', async () => {
    const owner = await createSession('owner@example.com', 'owner');
    const admin = await createSession('admin@example.com');

    await api(app, admin.cookie)
      .delete(`/admins/${encodeURIComponent('owner@example.com')}`)
      .expect(403);

    const row = await accessAllowlistModel.findOne({ email: 'owner@example.com' }).lean();

    expect(row?.revokedAt).toBeUndefined();
    expect(owner.cookie).toBeTruthy();
  });

  it('returns 404 when removing a missing active row', async () => {
    const owner = await createSession('owner@example.com', 'owner');

    await api(app, owner.cookie)
      .delete(`/admins/${encodeURIComponent('missing@example.com')}`)
      .expect(404);
  });
});
