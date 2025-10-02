import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Build: Schema Validation', () => {
    let ajv: Ajv2020

    beforeEach(() => {
        ajv = new Ajv2020({
            allErrors: true,
            verbose: true,
            strict: true,
            strictRequired: false,
            allowUnionTypes: true,
            validateFormats: true,
        })
        addFormats(ajv)

        const schemaPath = join(
            __dirname,
            '../../../packages/reputation-algorithms/src/schema/algorithm-definition.schema.json'
        )
        const schemaContent = readFileSync(schemaPath, 'utf-8')
        const schema = JSON.parse(schemaContent)
        ajv.addSchema(schema, 'algorithm-definition')
    })

    describe('Valid Fixtures', () => {
        it('should validate sample-algorithm.json', () => {
            const fixturePath = join(
                __dirname,
                '../../fixtures/valid/sample-algorithm.json'
            )
            const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'))

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate).toBeDefined()

            const isValid = validate?.(fixture)
            expect(isValid).toBe(true)
            expect(validate?.errors).toBeNull()
        })

        it('should validate voting_engagement from registry', () => {
            const algorithmPath = join(
                __dirname,
                '../../../packages/reputation-algorithms/src/registry/voting_engagement/1.0.0.json'
            )
            const algorithm = JSON.parse(readFileSync(algorithmPath, 'utf-8'))

            const validate = ajv.getSchema('algorithm-definition')
            const isValid = validate?.(algorithm)

            expect(isValid).toBe(true)
        })
    })

    describe('Invalid Fixtures', () => {
        it('should reject invalid-key.json with invalid key format', () => {
            const fixturePath = join(
                __dirname,
                '../../fixtures/invalid/invalid-key.json'
            )
            const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'))

            const validate = ajv.getSchema('algorithm-definition')
            const isValid = validate?.(fixture)

            expect(isValid).toBe(false)
            expect(validate?.errors).toBeDefined()
            expect(
                validate?.errors?.some((e) => e.instancePath === '/key')
            ).toBe(true)
        })

        it('should reject invalid-version.json with invalid version format', () => {
            const fixturePath = join(
                __dirname,
                '../../fixtures/invalid/invalid-version.json'
            )
            const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'))

            const validate = ajv.getSchema('algorithm-definition')
            const isValid = validate?.(fixture)

            expect(isValid).toBe(false)
            expect(
                validate?.errors?.some((e) => e.instancePath === '/version')
            ).toBe(true)
        })

        it('should reject missing-fields.json with missing required category', () => {
            const fixturePath = join(
                __dirname,
                '../../fixtures/invalid/missing-fields.json'
            )
            const fixture = JSON.parse(readFileSync(fixturePath, 'utf-8'))

            const validate = ajv.getSchema('algorithm-definition')
            const isValid = validate?.(fixture)

            expect(isValid).toBe(false)
            expect(
                validate?.errors?.some((e) => e.keyword === 'required')
            ).toBe(true)
        })
    })

    describe('Schema Constraints', () => {
        it('should require snake_case keys', () => {
            const invalid = {
                key: 'InvalidKey',
                name: 'Test',
                category: 'custom',
                description: 'Test',
                version: '1.0.0',
                inputs: [],
                outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
            }

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate?.(invalid)).toBe(false)
        })

        it('should require semantic version format', () => {
            const invalid = {
                key: 'test_algo',
                name: 'Test',
                category: 'custom',
                description: 'Test',
                version: 'v1.0',
                inputs: [],
                outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
            }

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate?.(invalid)).toBe(false)
        })

        it('should require at least one output', () => {
            const invalid = {
                key: 'test_algo',
                name: 'Test',
                category: 'custom',
                description: 'Test',
                version: '1.0.0',
                inputs: [],
                outputs: [],
            }

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate?.(invalid)).toBe(false)
        })

        it('should require csv metadata when type is csv', () => {
            const invalid = {
                key: 'test_algo',
                name: 'Test',
                category: 'custom',
                description: 'Test',
                version: '1.0.0',
                inputs: [
                    {
                        key: 'data',
                        type: 'csv',
                        // missing csv metadata
                    },
                ],
                outputs: [{ key: 'result', type: 'score_map', entity: 'user' }],
            }

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate?.(invalid)).toBe(false)
        })

        it('should require entity when type is score_map', () => {
            const invalid = {
                key: 'test_algo',
                name: 'Test',
                category: 'custom',
                description: 'Test',
                version: '1.0.0',
                inputs: [],
                outputs: [
                    {
                        key: 'result',
                        type: 'score_map',
                        // missing entity
                    },
                ],
            }

            const validate = ajv.getSchema('algorithm-definition')
            expect(validate?.(invalid)).toBe(false)
        })

        it('should accept valid categories', () => {
            const categories = ['engagement', 'quality', 'activity', 'custom']

            for (const category of categories) {
                const valid = {
                    key: 'test_algo',
                    name: 'Test',
                    category,
                    description: 'Test',
                    version: '1.0.0',
                    inputs: [],
                    outputs: [
                        { key: 'result', type: 'score_map', entity: 'user' },
                    ],
                }

                const validate = ajv.getSchema('algorithm-definition')
                expect(validate?.(valid)).toBe(true)
            }
        })
    })
})
