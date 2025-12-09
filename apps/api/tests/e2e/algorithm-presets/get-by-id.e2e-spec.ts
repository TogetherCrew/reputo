import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory';
import { createTestApp } from '../../utils/app-test.module';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { api } from '../../utils/request';

describe('GET /api/v1/algorithm-presets/:id', () => {
  let app: INestApplication;
  let algorithmPresetModel: Model<any>;

  beforeAll(async () => {
    const uri = await startMongo();
    const boot = await createTestApp({ mongoUri: uri });
    app = boot.app;
    algorithmPresetModel = boot.moduleRef.get(getModelToken('AlgorithmPreset'));
  });

  afterEach(async () => {
    await algorithmPresetModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
    await stopMongo();
  });

  it('should get preset by id (200)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel, {
      name: 'Test Preset',
      description: 'Test description for the preset',
    });

    const res = await api(app).get(`/algorithm-presets/${preset._id}`).expect(200);

    expect(res.body._id).toBe(preset._id.toString());
    expect(res.body.key).toBe(preset.key);
    expect(res.body.version).toBe(preset.version);
    expect(res.body.name).toBe('Test Preset');
    expect(res.body.description).toBe('Test description for the preset');
    expect(Array.isArray(res.body.inputs)).toBe(true);
    expect(typeof res.body.createdAt).toBe('string');
    expect(typeof res.body.updatedAt).toBe('string');
  });

  it('should return 400 for invalid id format', async () => {
    await api(app).get('/algorithm-presets/invalid-id').expect(400);
  });

  it('should return 404 when preset does not exist', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    await api(app).get(`/algorithm-presets/${fakeId}`).expect(404);
  });
});
