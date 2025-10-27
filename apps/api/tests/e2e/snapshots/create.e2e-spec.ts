import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory'
import { makeSnapshot } from '../../factories/snapshot.factory'

describe('POST /api/v1/snapshots', () => {
    let app: INestApplication
    let algorithmPresetModel: Model<any>
    let snapshotModel: Model<any>

    beforeAll(async () => {
        const uri = await startMongo()
        const boot = await createTestApp({ mongoUri: uri })
        app = boot.app
        algorithmPresetModel = boot.moduleRef.get(
            getModelToken('AlgorithmPreset')
        )
        snapshotModel = boot.moduleRef.get(getModelToken('Snapshot'))
    })

    afterEach(async () => {
        await snapshotModel.deleteMany({})
        await algorithmPresetModel.deleteMany({})
    })

    afterAll(async () => {
        await app.close()
        await stopMongo()
    })

    it('should create snapshot (201) with status defaulting to "queued"', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const dto = makeSnapshot(preset._id.toString())

        const res = await api(app).post('/snapshots').send(dto).expect(201)

        expect(res.body).toHaveProperty('_id')
        expect(res.body.algorithmPreset).toBe(preset._id.toString())
        expect(res.body.status).toBe('queued')
        expect(typeof res.body.createdAt).toBe('string')
        expect(typeof res.body.updatedAt).toBe('string')
    })

    it('should reject when algorithmPreset is missing (400)', async () => {
        await api(app).post('/snapshots').send({ outputs: {} }).expect(400)
    })

    it('should reject when algorithmPreset id format is invalid (400)', async () => {
        const dto = makeSnapshot('invalid-id')

        await api(app).post('/snapshots').send(dto).expect(400)
    })

    it('should reject when algorithmPreset does not exist (404)', async () => {
        const nonExistentId = '507f1f77bcf86cd799439011'
        const dto = makeSnapshot(nonExistentId)

        await api(app).post('/snapshots').send(dto).expect(404)
    })
})
