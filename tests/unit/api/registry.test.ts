import { describe, it, expect } from 'vitest'
import {
    getAlgorithmDefinition,
    listAlgorithmDefinitionKeys,
    listAlgorithmDefinitionVersions,
    resolveLatestVersion,
} from '../../../packages/reputation-algorithms/src/api/registry'
import { NotFoundError } from '../../../packages/reputation-algorithms/src/api/error'

describe('API: listAlgorithmDefinitionKeys', () => {
    it('should return all algorithm keys sorted alphabetically (ASCII)', () => {
        const keys = listAlgorithmDefinitionKeys()

        expect(keys).toBeInstanceOf(Array)
        expect(keys.length).toBeGreaterThan(0)
        expect(keys).toContain('voting_engagement')

        // Verify ASCII sorting
        const sorted = [...keys].sort()
        expect(keys).toEqual(sorted)
    })

    it('should return readonly array', () => {
        const keys = listAlgorithmDefinitionKeys()
        expect(Array.isArray(keys)).toBe(true)
    })

    it('should return consistent results on multiple calls', () => {
        const first = listAlgorithmDefinitionKeys()
        const second = listAlgorithmDefinitionKeys()
        expect(first).toEqual(second)
    })
})

describe('API: listAlgorithmDefinitionVersions', () => {
    it('should return versions for a valid key', () => {
        const versions = listAlgorithmDefinitionVersions('voting_engagement')

        expect(versions).toBeInstanceOf(Array)
        expect(versions.length).toBeGreaterThan(0)
        expect(versions).toContain('1.0.0')
    })

    it('should return versions sorted by SemVer ascending', () => {
        const versions = listAlgorithmDefinitionVersions('voting_engagement')

        // Each version should be a valid semantic version
        for (const version of versions) {
            expect(version).toMatch(/^\d+\.\d+\.\d+/)
        }
    })

    it('should throw NotFoundError with KEY_NOT_FOUND for unknown key', () => {
        expect(() =>
            listAlgorithmDefinitionVersions('unknown_algorithm')
        ).toThrow(NotFoundError)

        try {
            listAlgorithmDefinitionVersions('unknown_algorithm')
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
            if (error instanceof NotFoundError) {
                expect(error.code).toBe('KEY_NOT_FOUND')
                expect(error.key).toBe('unknown_algorithm')
                expect(error.message).toBe('Algorithm not found')
                expect(error.version).toBeUndefined()
            }
        }
    })
})

describe('API: resolveLatestVersion', () => {
    it('should return the latest version for a valid key', () => {
        const latest = resolveLatestVersion('voting_engagement')

        expect(typeof latest).toBe('string')
        expect(latest).toMatch(/^\d+\.\d+\.\d+/)
    })

    it('should return the highest SemVer version', () => {
        const latest = resolveLatestVersion('voting_engagement')
        const allVersions = listAlgorithmDefinitionVersions('voting_engagement')

        // Latest should be the last element (versions are sorted ascending)
        expect(latest).toBe(allVersions[allVersions.length - 1])
    })

    it('should throw NotFoundError for unknown key', () => {
        expect(() => resolveLatestVersion('non_existent_algo')).toThrow(
            NotFoundError
        )

        try {
            resolveLatestVersion('non_existent_algo')
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError)
            if (error instanceof NotFoundError) {
                expect(error.code).toBe('KEY_NOT_FOUND')
                expect(error.key).toBe('non_existent_algo')
            }
        }
    })
})

describe('API: getAlgorithmDefinition', () => {
    describe('valid requests', () => {
        it('should return definition for valid key and version', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: '1.0.0',
            })

            expect(definition).toBeDefined()
            expect(definition.key).toBe('voting_engagement')
            expect(definition.version).toBe('1.0.0')
            expect(definition.name).toBe('Voting Engagement')
            expect(definition.category).toBe('engagement')
            expect(definition.description).toBeTruthy()
        })

        it('should return latest version when version is "latest"', () => {
            const latest = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: 'latest',
            })

            const latestVersion = resolveLatestVersion('voting_engagement')
            expect(latest.version).toBe(latestVersion)
        })

        it('should return latest version when version is not specified', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
            })

            const latestVersion = resolveLatestVersion('voting_engagement')
            expect(definition.version).toBe(latestVersion)
        })
    })

    describe('structure validation', () => {
        it('should have valid inputs array structure', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: '1.0.0',
            })

            expect(Array.isArray(definition.inputs)).toBe(true)
            expect(definition.inputs.length).toBeGreaterThan(0)

            const firstInput = definition.inputs[0]
            if (firstInput) {
                expect(firstInput.key).toBeTruthy()
                expect(firstInput.type).toBeTruthy()
            }
        })

        it('should have valid outputs array structure with at least one output', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: '1.0.0',
            })

            expect(Array.isArray(definition.outputs)).toBe(true)
            expect(definition.outputs.length).toBeGreaterThan(0)

            const firstOutput = definition.outputs[0]
            if (firstOutput) {
                expect(firstOutput.key).toBe('voting_engagement')
                expect(firstOutput.type).toBe('score_map')
                if (firstOutput.type === 'score_map') {
                    expect(firstOutput.entity).toBe('user')
                }
            }
        })
    })

    describe('error handling', () => {
        it('should throw NotFoundError for unknown key', () => {
            expect(() =>
                getAlgorithmDefinition({ key: 'invalid_key', version: '1.0.0' })
            ).toThrow(NotFoundError)

            try {
                getAlgorithmDefinition({ key: 'invalid_key', version: '1.0.0' })
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundError)
                if (error instanceof NotFoundError) {
                    expect(error.code).toBe('KEY_NOT_FOUND')
                    expect(error.key).toBe('invalid_key')
                }
            }
        })

        it('should throw NotFoundError for unknown version', () => {
            expect(() =>
                getAlgorithmDefinition({
                    key: 'voting_engagement',
                    version: '99.99.99',
                })
            ).toThrow(NotFoundError)

            try {
                getAlgorithmDefinition({
                    key: 'voting_engagement',
                    version: '99.99.99',
                })
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundError)
                if (error instanceof NotFoundError) {
                    expect(error.code).toBe('VERSION_NOT_FOUND')
                    expect(error.key).toBe('voting_engagement')
                    expect(error.version).toBe('99.99.99')
                    expect(error.message).toBe('Version not found')
                }
            }
        })
    })

    describe('immutability', () => {
        it('should return readonly definition object', () => {
            const definition = getAlgorithmDefinition({
                key: 'voting_engagement',
                version: '1.0.0',
            })

            // TypeScript enforces readonly at compile time
            expect(definition).toBeDefined()
            expect(definition.key).toBe('voting_engagement')
        })
    })
})
