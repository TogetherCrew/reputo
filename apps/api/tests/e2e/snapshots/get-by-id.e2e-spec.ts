import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory'
import { insertSnapshot } from '../../factories/snapshot.factory'

describe('GET /api/v1/snapshots/:id', () => {
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

    it('should get snapshot with frozen preset by id (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'test_key',
            version: '2.0.0',
        })
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        const snapshot = await insertSnapshot(snapshotModel, presetData)

        const res = await api(app).get(`/snapshots/${snapshot._id}`).expect(200)

        expect(res.body._id).toBe(snapshot._id.toString())
        expect(res.body.algorithmPresetFrozen).toBeInstanceOf(Object)
        expect(res.body.algorithmPresetFrozen.key).toBe('test_key')
        expect(res.body.algorithmPresetFrozen.version).toBe('2.0.0')
        expect(res.body.status).toBe('queued')
        expect(typeof res.body.createdAt).toBe('string')
        expect(typeof res.body.updatedAt).toBe('string')
    })

    it('should return 400 for invalid id format', async () => {
        await api(app).get('/snapshots/invalid-id').expect(400)
    })

    it('should return 404 when snapshot does not exist', async () => {
        const fakeId = '507f1f77bcf86cd799439011'

        await api(app).get(`/snapshots/${fakeId}`).expect(404)
    })
})
