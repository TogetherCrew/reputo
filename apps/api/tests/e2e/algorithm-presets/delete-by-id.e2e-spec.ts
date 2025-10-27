import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { startMongo, stopMongo } from '../../utils/mongo-memory-server'
import { createTestApp } from '../../utils/app-test.module'
import { api } from '../../utils/request'
import { insertAlgorithmPreset } from '../../factories/algorithmPreset.factory'

describe('DELETE /api/v1/algorithm-presets/:id', () => {
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

    it('should delete preset by id (204) with no body', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)

        const res = await api(app)
            .delete(`/algorithm-presets/${preset._id}`)
            .expect(204)

        // 204 No Content should have empty body
        expect(res.body).toEqual({})
        expect(res.text).toBe('')

        // Verify preset is deleted from database
        const count = await algorithmPresetModel.countDocuments({
            _id: preset._id,
        })
        expect(count).toBe(0)
    })

    it('should return 400 for invalid id format', async () => {
        await api(app).delete('/algorithm-presets/invalid-id').expect(400)
    })

    it('should return 404 when preset does not exist', async () => {
        const fakeId = '507f1f77bcf86cd799439011'

        await api(app).delete(`/algorithm-presets/${fakeId}`).expect(404)
    })

    it('should make subsequent GET by id return 404 after deletion', async () => {
        const preset = await insertAlgorithmPreset(algorithmPresetModel)

        // Delete the preset
        await api(app).delete(`/algorithm-presets/${preset._id}`).expect(204)

        // Attempting to GET should return 404
        await api(app).get(`/algorithm-presets/${preset._id}`).expect(404)
    })
})
