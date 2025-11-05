import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import {
    insertAlgorithmPreset,
    randomAlgorithmPreset,
} from '../../factories/algorithmPreset.factory'
import { insertSnapshot } from '../../factories/snapshot.factory'
import { assertPaginationStructure } from '../../utils/pagination'

describe('GET /api/v1/snapshots', () => {
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

    it('should list snapshots with default pagination (200) and PaginationDto shape', async () => {
        const preset1 = await insertAlgorithmPreset(
            algorithmPresetModel,
            randomAlgorithmPreset()
        )
        const preset2 = await insertAlgorithmPreset(
            algorithmPresetModel,
            randomAlgorithmPreset()
        )

        const {
            createdAt: c1,
            updatedAt: u1,
            ...preset1Data
        } = preset1.toObject()
        const {
            createdAt: c2,
            updatedAt: u2,
            ...preset2Data
        } = preset2.toObject()

        for (let i = 0; i < 15; i++) {
            const presetData = i % 2 === 0 ? preset1Data : preset2Data
            await insertSnapshot(snapshotModel, presetData)
        }

        const res = await api(app).get('/snapshots').expect(200)

        assertPaginationStructure(res.body)
        expect(res.body.page).toBe(1)
        expect(res.body.limit).toBe(10)
        expect(res.body.results).toHaveLength(10)
        expect(res.body.totalResults).toBe(15)
        expect(res.body.totalPages).toBe(2)

        res.body.results.forEach((snapshot: any) => {
            expect(snapshot).toHaveProperty('_id')
            expect(snapshot).toHaveProperty('algorithmPresetFrozen')
            expect(snapshot.algorithmPresetFrozen).toHaveProperty('key')
            expect(snapshot.algorithmPresetFrozen).toHaveProperty('version')
            expect(snapshot).toHaveProperty('status')
            expect(snapshot).toHaveProperty('createdAt')
            expect(snapshot).toHaveProperty('updatedAt')
        })
    })

    it('should filter by status=queued (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        const snapshot1 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot1._id },
            { status: 'queued' }
        )
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot2._id },
            { status: 'running' }
        )

        const res = await api(app).get('/snapshots?status=queued').expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].status).toBe('queued')
    })

    it('should filter by status=running (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot2._id },
            { status: 'running' }
        )

        const res = await api(app).get('/snapshots?status=running').expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].status).toBe('running')
    })

    it('should filter by status=completed (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot2._id },
            { status: 'completed' }
        )

        const res = await api(app)
            .get('/snapshots?status=completed')
            .expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].status).toBe('completed')
    })

    it('should filter by status=failed (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot2._id },
            { status: 'failed' }
        )

        const res = await api(app).get('/snapshots?status=failed').expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].status).toBe('failed')
    })

    it('should filter by status=cancelled (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)
        await snapshotModel.updateOne(
            { _id: snapshot2._id },
            { status: 'cancelled' }
        )

        const res = await api(app)
            .get('/snapshots?status=cancelled')
            .expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].status).toBe('cancelled')
    })

    it('should filter by key (200) on frozen preset field', async () => {
        const preset1 = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'target_key',
        })
        const preset2 = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'other_key',
        })

        const {
            createdAt: c1,
            updatedAt: u1,
            ...preset1Data
        } = preset1.toObject()
        const {
            createdAt: c2,
            updatedAt: u2,
            ...preset2Data
        } = preset2.toObject()

        await insertSnapshot(snapshotModel, preset1Data)
        await insertSnapshot(snapshotModel, preset2Data)

        const res = await api(app).get('/snapshots?key=target_key').expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].algorithmPresetFrozen.key).toBe('target_key')
    })

    it('should filter by version (200) on frozen preset field', async () => {
        const preset1 = await insertAlgorithmPreset(algorithmPresetModel, {
            version: '2.0.0',
        })
        const preset2 = await insertAlgorithmPreset(algorithmPresetModel, {
            version: '1.0.0',
        })

        const {
            createdAt: c1,
            updatedAt: u1,
            ...preset1Data
        } = preset1.toObject()
        const {
            createdAt: c2,
            updatedAt: u2,
            ...preset2Data
        } = preset2.toObject()

        await insertSnapshot(snapshotModel, preset1Data)
        await insertSnapshot(snapshotModel, preset2Data)

        const res = await api(app).get('/snapshots?version=2.0.0').expect(200)

        expect(res.body.totalResults).toBe(1)
        expect(res.body.results[0].algorithmPresetFrozen.version).toBe('2.0.0')
    })

    it('should sort by createdAt:desc (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        const snapshot1 = await insertSnapshot(snapshotModel, presetData)
        await new Promise((resolve) => setTimeout(resolve, 10))
        const snapshot2 = await insertSnapshot(snapshotModel, presetData)

        const res = await api(app).get('/snapshots').expect(200)

        expect(res.body.results[0]._id).toBe(snapshot2._id.toString())
        expect(res.body.results[1]._id).toBe(snapshot1._id.toString())
    })

    it('should return empty results when filters match nothing (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)

        const res = await api(app)
            .get('/snapshots?status=completed')
            .expect(200)

        assertPaginationStructure(res.body)
        expect(res.body.results).toEqual([])
        expect(res.body.totalResults).toBe(0)
    })

    it('should return frozen algorithmPreset data (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'test_key',
            version: '1.0.0',
        })
        const { createdAt, updatedAt, ...presetData } = preset.toObject()

        await insertSnapshot(snapshotModel, presetData)

        const res = await api(app).get('/snapshots').expect(200)

        expect(res.body.results[0].algorithmPresetFrozen).toBeInstanceOf(Object)
        expect(res.body.results[0].algorithmPresetFrozen.key).toBe('test_key')
        expect(res.body.results[0].algorithmPresetFrozen.version).toBe('1.0.0')
        // Verify timestamps are preserved in frozen preset
        expect(typeof res.body.results[0].algorithmPresetFrozen.createdAt).toBe(
            'string'
        )
        expect(typeof res.body.results[0].algorithmPresetFrozen.updatedAt).toBe(
            'string'
        )
    })
})
