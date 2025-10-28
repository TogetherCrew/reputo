import { faker } from '@faker-js/faker'
import type { Model, Document } from 'mongoose'

export type SnapshotCreate = {
    algorithmPreset: string
    temporal?: {
        workflowId?: string
        runId?: string
        taskQueue?: string
    }
    outputs?: unknown
}

export function makeSnapshot(
    algorithmPresetId: string,
    overrides: Partial<Omit<SnapshotCreate, 'algorithmPreset'>> = {}
): SnapshotCreate {
    return {
        algorithmPreset: algorithmPresetId,
        temporal: overrides.temporal,
        outputs: overrides.outputs,
    }
}


export async function insertSnapshot<T extends Document>(
    model: Model<T>,
    algorithmPresetId: string,
    overrides: Partial<Omit<SnapshotCreate, 'algorithmPreset'>> = {}
): Promise<T> {
    const dto = makeSnapshot(algorithmPresetId, overrides)
    const doc = await model.create(dto as any)
    return doc
}


export function randomSnapshot(algorithmPresetId: string): SnapshotCreate {
    const maybe = <T>(val: T) => (faker.datatype.boolean() ? val : undefined)
    return makeSnapshot(algorithmPresetId, {
        temporal: maybe({
            workflowId: faker.string.alphanumeric(20),
            runId: faker.string.alphanumeric(10),
            taskQueue: 'algorithms',
        }),
        outputs: maybe({
            result: faker.number.int({ min: 0, max: 100 }),
            timestamp: faker.date.recent().toISOString(),
        }),
    })
}
