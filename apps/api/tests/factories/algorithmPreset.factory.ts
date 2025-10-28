import { faker } from '@faker-js/faker'
import type { Model, Document } from 'mongoose'

export type AlgorithmPresetCreate = {
    key?: string
    version?: string
    inputs?: Array<{ key: string; value?: unknown }>
    name?: string
    description?: string
}

export function makeAlgorithmPreset(overrides: AlgorithmPresetCreate = {}) {
    return {
        key: overrides.key ?? 'voting_engagement',
        version: overrides.version ?? '1.0.0',
        inputs: overrides.inputs ?? [
            { key: 'votes', value: 's3://tc/votes.csv' },
        ],
        name: overrides.name,
        description: overrides.description,
    }
}


export async function insertAlgorithmPreset<T extends Document>(
    model: Model<T>,
    overrides: AlgorithmPresetCreate = {}
): Promise<T> {
    const dto = makeAlgorithmPreset(overrides)
    const doc = await model.create(dto as any)
    return doc
}


export function randomAlgorithmPreset(): AlgorithmPresetCreate {
    const maybe = <T>(val: T) => (faker.datatype.boolean() ? val : undefined)
    return makeAlgorithmPreset({
        key: faker.word.noun().toLowerCase().replace(/\s+/g, '_'),
        version: `${faker.number.int({ min: 1, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
        name: maybe(faker.lorem.words(3)),
        description: maybe(faker.lorem.sentence(10)),
    })
}
