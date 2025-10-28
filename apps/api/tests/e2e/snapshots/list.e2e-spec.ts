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

        for (let i = 0; i < 15; i++) {
            const preset = i % 2 === 0 ? preset1._id : preset2._id
            await insertSnapshot(snapshotModel, preset.toString())
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
            expect(snapshot).toHaveProperty('algorithmPreset')
            expect(snapshot).toHaveProperty('status')
            expect(snapshot).toHaveProperty('createdAt')
            expect(snapshot).toHaveProperty('updatedAt')
        })
    })

    it('should filter by status=queued (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        const snapshot1 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
        await snapshotModel.updateOne(
            { _id: snapshot1._id },
            { status: 'queued' }
        )
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
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
        await insertSnapshot(snapshotModel, preset._id.toString())
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
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
        await insertSnapshot(snapshotModel, preset._id.toString())
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
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
        await insertSnapshot(snapshotModel, preset._id.toString())
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
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
        await insertSnapshot(snapshotModel, preset._id.toString())
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
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

    it('should filter by algorithmPreset id (200)', async () => {
        const preset1 = await insertAlgorithmPreset(algorithmPresetModel)
        const preset2 = await insertAlgorithmPreset(algorithmPresetModel)

        await insertSnapshot(snapshotModel, preset1._id.toString())
        await insertSnapshot(snapshotModel, preset1._id.toString())
        await insertSnapshot(snapshotModel, preset2._id.toString())

        const res = await api(app)
            .get(`/snapshots?algorithmPreset=${preset1._id}`)
            .expect(200)

        expect(res.body.totalResults).toBe(2)
        res.body.results.forEach((snapshot: any) => {
            expect(snapshot.algorithmPreset).toBe(preset1._id.toString())
        })
    })

    it('should return 400 for invalid algorithmPreset id format in filter', async () => {
        await api(app).get('/snapshots?algorithmPreset=invalid-id').expect(400)
    })

    it('should filter by key (200) through related preset', async () => {
        const preset1 = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'target_key',
        })
        const preset2 = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'other_key',
        })

        await insertSnapshot(snapshotModel, preset1._id.toString())
        await insertSnapshot(snapshotModel, preset2._id.toString())

        const res = await api(app).get('/snapshots?key=target_key').expect(200)

        expect(res.body.totalResults).toBe(1)
    })

    it('should filter by version (200) through related preset', async () => {
        const preset1 = await insertAlgorithmPreset(algorithmPresetModel, {
            version: '2.0.0',
        })
        const preset2 = await insertAlgorithmPreset(algorithmPresetModel, {
            version: '1.0.0',
        })

        await insertSnapshot(snapshotModel, preset1._id.toString())
        await insertSnapshot(snapshotModel, preset2._id.toString())

        const res = await api(app).get('/snapshots?version=2.0.0').expect(200)

        expect(res.body.totalResults).toBe(1)
    })

    it('should sort by createdAt:desc (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)

        const snapshot1 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )
        await new Promise((resolve) => setTimeout(resolve, 10))
        const snapshot2 = await insertSnapshot(
            snapshotModel,
            preset._id.toString()
        )

        const res = await api(app).get('/snapshots').expect(200)

        expect(res.body.results[0]._id).toBe(snapshot2._id.toString())
        expect(res.body.results[1]._id).toBe(snapshot1._id.toString())
    })

    it('should return empty results when filters match nothing (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)
        await insertSnapshot(snapshotModel, preset._id.toString())

        const res = await api(app)
            .get('/snapshots?status=completed')
            .expect(200)

        assertPaginationStructure(res.body)
        expect(res.body.results).toEqual([])
        expect(res.body.totalResults).toBe(0)
    })

    it('should populate algorithmPreset when populate=algorithmPreset (200)', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel, {
            key: 'test_key',
            version: '1.0.0',
        })
        await insertSnapshot(snapshotModel, preset._id.toString())

        const res = await api(app)
            .get('/snapshots?populate=algorithmPreset')
            .expect(200)

        expect(res.body.results[0].algorithmPreset).toBeInstanceOf(Object)
        expect(res.body.results[0].algorithmPreset.key).toBe('test_key')
        expect(res.body.results[0].algorithmPreset.version).toBe('1.0.0')
    })
})
