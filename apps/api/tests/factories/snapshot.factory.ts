import { faker } from '@faker-js/faker'
import type { Model, Document } from 'mongoose'

type AlgorithmPresetFrozen = {
    key: string
    version: string
    inputs: Array<{ key: string; value?: unknown }>
    name?: string
    description?: string
}

export type SnapshotCreate = {
    algorithmPresetFrozen: AlgorithmPresetFrozen
    temporal?: {
        workflowId?: string
        runId?: string
        taskQueue?: string
    }
    outputs?: unknown
}

export type SnapshotCreateDto = {
    algorithmPresetId: string
    temporal?: {
        workflowId?: string
        runId?: string
        taskQueue?: string
    }
    outputs?: unknown
}

export function makeSnapshot(
    algorithmPresetFrozen: AlgorithmPresetFrozen,
    overrides: Partial<Omit<SnapshotCreate, 'algorithmPresetFrozen'>> = {}
): SnapshotCreate {
    return {
        algorithmPresetFrozen,
        temporal: overrides.temporal,
        outputs: overrides.outputs,
    }
}

export function makeSnapshotDto(
    algorithmPresetId: string,
    overrides: Partial<Omit<SnapshotCreateDto, 'algorithmPresetId'>> = {}
): SnapshotCreateDto {
    return {
        algorithmPresetId,
        temporal: overrides.temporal,
        outputs: overrides.outputs,
    }
}

export async function insertSnapshot<T extends Document>(
    model: Model<T>,
    algorithmPresetFrozen: AlgorithmPresetFrozen,
    overrides: Partial<Omit<SnapshotCreate, 'algorithmPresetFrozen'>> = {}
): Promise<T> {
    const dto = makeSnapshot(algorithmPresetFrozen, overrides)
    const doc = await model.create(dto as any)
    return doc
}

export function randomSnapshot(
    algorithmPresetFrozen: AlgorithmPresetFrozen
): SnapshotCreate {
    const maybe = <T>(val: T) => (faker.datatype.boolean() ? val : undefined)
    return makeSnapshot(algorithmPresetFrozen, {
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
