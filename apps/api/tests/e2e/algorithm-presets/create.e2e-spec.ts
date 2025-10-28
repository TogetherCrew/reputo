import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import { makeAlgorithmPreset } from '../../factories/algorithmPreset.factory'

describe('POST /api/v1/algorithm-presets', () => {
    let app: INestApplication
    let algorithmPresetModel: Model<any>

    beforeAll(async () => {
        const uri = await startMongo()
        const boot = await createTestApp({ mongoUri: uri })
        app = boot.app
        algorithmPresetModel = boot.moduleRef.get(
            getModelToken('AlgorithmPreset')
        )
    })

    afterEach(async () => {
        await algorithmPresetModel.deleteMany({})
    })

    afterAll(async () => {
        await app.close()
        await stopMongo()
    })

    it('should create algorithm preset (201) with required fields only', async () => {
        const dto = makeAlgorithmPreset()

        const res = await api(app)
            .post('/algorithm-presets')
            .send(dto)
            .expect(201)

        expect(res.body).toHaveProperty('_id')
        expect(res.body.key).toBe(dto.key)
        expect(res.body.version).toBe(dto.version)
        expect(Array.isArray(res.body.inputs)).toBe(true)
        expect(res.body.inputs).toHaveLength(dto.inputs.length)
        expect(typeof res.body.createdAt).toBe('string')
        expect(typeof res.body.updatedAt).toBe('string')
    })

    it('should persist optional name and description when valid (201)', async () => {
        const dto = makeAlgorithmPreset({
            name: 'Valid Algorithm Name',
            description:
                'This is a valid description with more than 10 characters',
        })

        const res = await api(app)
            .post('/algorithm-presets')
            .send(dto)
            .expect(201)

        expect(res.body.name).toBe(dto.name)
        expect(res.body.description).toBe(dto.description)
    })

    it('should reject when key is missing (400)', async () => {
        const dto = makeAlgorithmPreset()
        delete (dto as any).key

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when version is missing (400)', async () => {
        const dto = makeAlgorithmPreset()
        delete (dto as any).version

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when inputs is missing (400)', async () => {
        const dto = makeAlgorithmPreset()
        delete (dto as any).inputs

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when any input item has no key (400)', async () => {
        const dto = makeAlgorithmPreset({
            inputs: [
                { key: 'valid', value: 'data' },
                { value: 'missing-key' },
            ] as any,
        })

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when name is shorter than 3 chars (400)', async () => {
        const dto = makeAlgorithmPreset({ name: 'ab' })

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when name is longer than 100 chars (400)', async () => {
        const dto = makeAlgorithmPreset({ name: 'a'.repeat(101) })

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when description is shorter than 10 chars (400)', async () => {
        const dto = makeAlgorithmPreset({ description: 'short' })

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })

    it('should reject when description is longer than 500 chars (400)', async () => {
        const dto = makeAlgorithmPreset({ description: 'a'.repeat(501) })

        await api(app).post('/algorithm-presets').send(dto).expect(400)
    })
})
