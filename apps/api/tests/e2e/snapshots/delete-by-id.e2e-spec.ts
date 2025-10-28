import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import { insertSnapshot } from '../../factories/snapshot.factory'

describe('DELETE /api/v1/snapshots/:id', () => {
    let app: INestApplication
    let snapshotModel: Model<any>

    beforeAll(async () => {
        const uri = await startMongo()
        const boot = await createTestApp({ mongoUri: uri })
        app = boot.app
        snapshotModel = boot.moduleRef.get(getModelToken('Snapshot'))
    })

    afterEach(async () => {
        await snapshotModel.deleteMany({})
    })

    afterAll(async () => {
        await app.close()
        await stopMongo()
    })

    it('should delete snapshot by id (204) with no body', async () => {
        const snapshot = await insertSnapshot(
            snapshotModel,
            '507f1f77bcf86cd799439011'
        )

        const res = await api(app)
            .delete(`/snapshots/${snapshot._id}`)
            .expect(204)

        expect(res.body).toEqual({})
        expect(res.text).toBe('')

        const count = await snapshotModel.countDocuments({
            _id: snapshot._id,
        })
        expect(count).toBe(0)
    })

    it('should return 400 for invalid id format', async () => {
        await api(app).delete('/snapshots/invalid-id').expect(400)
    })

    it('should return 404 when snapshot does not exist', async () => {
        const fakeId = '507f1f77bcf86cd799439011'

        await api(app).delete(`/snapshots/${fakeId}`).expect(404)
    })

    it('should make subsequent GET by id return 404 after deletion', async () => {
        const snapshot = await insertSnapshot(
            snapshotModel,
            '507f1f77bcf86cd799439011'
        )

        await api(app).delete(`/snapshots/${snapshot._id}`).expect(204)

        await api(app).get(`/snapshots/${snapshot._id}`).expect(404)
    })
})
