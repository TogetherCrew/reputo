import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory';
import { makeSnapshotDto } from '../../factories/snapshot.factory';
import { createTestApp } from '../../utils/app-test.module';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { api } from '../../utils/request';

describe('POST /api/v1/snapshots', () => {
  let app: INestApplication;
  let algorithmPresetModel: Model<any>;
  let snapshotModel: Model<any>;

  beforeAll(async () => {
    const uri = await startMongo();
    const boot = await createTestApp({ mongoUri: uri });
    app = boot.app;
    algorithmPresetModel = boot.moduleRef.get(getModelToken('AlgorithmPreset'));
    snapshotModel = boot.moduleRef.get(getModelToken('Snapshot'));
  });

  afterEach(async () => {
    await snapshotModel.deleteMany({});
    await algorithmPresetModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('should create snapshot (201) with frozen preset and status defaulting to "queued"', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel, {
      key: 'test_algo',
      version: '1.0.0',
    });
    const dto = makeSnapshotDto(preset._id.toString());

    const res = await api(app).post('/snapshots').send(dto).expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.algorithmPresetFrozen).toBeInstanceOf(Object);
    expect(res.body.algorithmPresetFrozen.key).toBe('test_algo');
    expect(res.body.algorithmPresetFrozen.version).toBe('1.0.0');
    // Verify timestamps are preserved in frozen preset
    expect(typeof res.body.algorithmPresetFrozen.createdAt).toBe('string');
    expect(typeof res.body.algorithmPresetFrozen.updatedAt).toBe('string');
    expect(res.body.status).toBe('queued');
    expect(typeof res.body.createdAt).toBe('string');
    expect(typeof res.body.updatedAt).toBe('string');
  });

  it('should reject when algorithmPresetId is missing (400)', async () => {
    await api(app).post('/snapshots').send({ outputs: {} }).expect(400);
  });

  it('should reject when algorithmPresetId format is invalid (400)', async () => {
    const dto = makeSnapshotDto('invalid-id');

    await api(app).post('/snapshots').send(dto).expect(400);
  });

  it('should reject when algorithmPresetId does not exist (404)', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const dto = makeSnapshotDto(nonExistentId);

    await api(app).post('/snapshots').send(dto).expect(404);
  });
});
