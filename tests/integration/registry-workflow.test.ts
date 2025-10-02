import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
    listAlgorithmDefinitionKeys,
    listAlgorithmDefinitionVersions,
    getAlgorithmDefinition,
    resolveLatestVersion,
} from '../../packages/reputation-algorithms/src/api/registry'

describe('Integration: Registry Workflow', () => {
    describe('End-to-End API Usage', () => {
        it('should list all available algorithms', () => {
            const keys = listAlgorithmDefinitionKeys()
            expect(keys).toBeDefined()
            expect(Array.isArray(keys)).toBe(true)
            expect(keys.length).toBeGreaterThan(0)
        })

        it('should get versions for each algorithm', () => {
            const keys = listAlgorithmDefinitionKeys()

            for (const key of keys) {
                const versions = listAlgorithmDefinitionVersions(key)
                expect(versions).toBeDefined()
                expect(Array.isArray(versions)).toBe(true)
                expect(versions.length).toBeGreaterThan(0)
            }
        })

        it('should resolve latest version and fetch definition', () => {
            const keys = listAlgorithmDefinitionKeys()

            for (const key of keys) {
                const latest = resolveLatestVersion(key)
                expect(latest).toBeDefined()
                expect(typeof latest).toBe('string')

                const definition = getAlgorithmDefinition({
                    key,
                    version: latest,
                })
                expect(definition.key).toBe(key)
                expect(definition.version).toBe(latest)
            }
        })

        it('should fetch definition with version "latest"', () => {
            const keys = listAlgorithmDefinitionKeys()

            for (const key of keys) {
                const definition = getAlgorithmDefinition({
                    key,
                    version: 'latest',
                })
                const latest = resolveLatestVersion(key)

                expect(definition.version).toBe(latest)
            }
        })

        it('should fetch definition without specifying version', () => {
            const keys = listAlgorithmDefinitionKeys()

            for (const key of keys) {
                const definition = getAlgorithmDefinition({ key })
                const latest = resolveLatestVersion(key)

                expect(definition.version).toBe(latest)
            }
        })
    })

    describe('Data Integrity', () => {
        it('should have consistent data across API calls', () => {
            const key = 'voting_engagement'

            const definition1 = getAlgorithmDefinition({
                key,
                version: '1.0.0',
            })
            const definition2 = getAlgorithmDefinition({
                key,
                version: '1.0.0',
            })

            expect(definition1).toEqual(definition2)
        })

        it('should have all required fields in definitions', () => {
            const keys = listAlgorithmDefinitionKeys()

            for (const key of keys) {
                const definition = getAlgorithmDefinition({ key })

                // Required fields
                expect(definition.key).toBeDefined()
                expect(definition.name).toBeDefined()
                expect(definition.category).toBeDefined()
                expect(definition.description).toBeDefined()
                expect(definition.version).toBeDefined()
                expect(definition.inputs).toBeDefined()
                expect(definition.outputs).toBeDefined()

                // Outputs must have at least one item
                expect(definition.outputs.length).toBeGreaterThan(0)
            }
        })

        it('should have valid input/output structures', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: '1.0.0',
            })

            // Check inputs
            for (const input of definition.inputs) {
                expect(input.key).toBeDefined()
                expect(input.type).toBeDefined()

                if (input.type === 'csv') {
                    expect(input.csv).toBeDefined()
                    expect(input.csv?.columns).toBeDefined()
                    expect(input.csv?.columns.length).toBeGreaterThan(0)
                }

                if (input.type === 'score_map') {
                    expect(input.entity).toBeDefined()
                }
            }

            // Check outputs
            for (const output of definition.outputs) {
                expect(output.key).toBeDefined()
                expect(output.type).toBeDefined()

                if (output.type === 'score_map') {
                    expect(output.entity).toBeDefined()
                }
            }
        })
    })
})
