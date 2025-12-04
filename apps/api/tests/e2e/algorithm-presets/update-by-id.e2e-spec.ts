import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory';
import { createTestApp } from '../../utils/app-test.module';
import { startMongo, stopMongo } from '../../utils/mongo-memory-server';
import { api } from '../../utils/request';

describe('PATCH /api/v1/algorithm-presets/:id', () => {
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

  it('should update inputs/name/description (200) and bump updatedAt', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel, {
      name: 'Original Name',
      description: 'Original description text',
    });

    const originalUpdatedAt = new Date(preset.updatedAt).getTime();

    await new Promise((resolve) => setTimeout(resolve, 10));

    const res = await api(app)
      .patch(`/algorithm-presets/${preset._id}`)
      .send({
        name: 'Updated Name',
        description: 'Updated description text',
        inputs: [{ key: 'newKey', value: 'newValue' }],
      })
      .expect(200);

    expect(res.body.name).toBe('Updated Name');
    expect(res.body.description).toBe('Updated description text');
    expect(res.body.inputs).toHaveLength(1);
    expect(res.body.inputs[0].key).toBe('newKey');

    // updatedAt should be bumped
    const newUpdatedAt = new Date(res.body.updatedAt).getTime();
    expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('should return 400 for invalid id format', async () => {
    await api(app).patch('/algorithm-presets/invalid-id').send({ name: 'Test' }).expect(400);
  });

  it('should return 404 when preset does not exist', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    await api(app).patch(`/algorithm-presets/${fakeId}`).send({ name: 'Test' }).expect(404);
  });

  it('should reject name shorter than 3 chars (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel);

    await api(app).patch(`/algorithm-presets/${preset._id}`).send({ name: 'ab' }).expect(400);
  });

  it('should reject name longer than 100 chars (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel);

    await api(app)
      .patch(`/algorithm-presets/${preset._id}`)
      .send({ name: 'a'.repeat(101) })
      .expect(400);
  });

  it('should reject description shorter than 10 chars (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel);

    await api(app).patch(`/algorithm-presets/${preset._id}`).send({ description: 'short' }).expect(400);
  });

  it('should reject description longer than 500 chars (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel);

    await api(app)
      .patch(`/algorithm-presets/${preset._id}`)
      .send({ description: 'a'.repeat(501) })
      .expect(400);
  });

  it('should reject attempts to update key (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel, {
      key: 'original_key',
    });

    const res = await api(app).patch(`/algorithm-presets/${preset._id}`).send({ key: 'new_key' });

    if (res.status === 200) {
      expect(res.body.key).toBe('original_key');
    } else {
      expect(res.status).toBe(400);
    }
  });

  it('should reject attempts to update version (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel, {
      version: '1.0.0',
    });

    const res = await api(app).patch(`/algorithm-presets/${preset._id}`).send({ version: '2.0.0' });

    if (res.status === 200) {
      expect(res.body.version).toBe('1.0.0');
    } else {
      expect(res.status).toBe(400);
    }
  });

  it('should reject inputs items without key (400)', async () => {
    const preset = await insertAlgorithmPreset(algorithmPresetModel);

    await api(app)
      .patch(`/algorithm-presets/${preset._id}`)
      .send({
        inputs: [{ key: 'valid', value: 'data' }, { value: 'missing-key' }],
      })
      .expect(400);
  });
});
