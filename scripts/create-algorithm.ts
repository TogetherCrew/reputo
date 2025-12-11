#!/usr/bin/env tsx

/**
 * Unified CLI for creating algorithm definitions and scaffolding activities.
 *
 * This script orchestrates both:
 * 1. Creating an algorithm definition in packages/reputation-algorithms
 * 2. Scaffolding an activity implementation in apps/typescript-worker
 *
 * Usage:
 *   pnpm algorithm:create <key> <version>
 *
 * Examples:
 *   pnpm algorithm:create voting_engagement 1.0.0
 *   pnpm algorithm:create proposal_engagement 2.0.0
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    validateKey,
    validateVersion,
} from '../packages/reputation-algorithms/src/shared/utils/validation.js'
import { createAlgorithmTemplate } from '../packages/reputation-algorithms/src/shared/utils/templates.js'
import { generateActivityScaffold } from '../apps/typescript-worker/src/scripts/scaffold-algorithm.js'

// Get monorepo root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const MONOREPO_ROOT = join(__dirname, '..')

// Package paths
const REPUTATION_ALGORITHMS_PATH = join(
    MONOREPO_ROOT,
    'packages',
    'reputation-algorithms'
)
const TYPESCRIPT_WORKER_PATH = join(MONOREPO_ROOT, 'apps', 'typescript-worker')

// ============================================================================
// Algorithm Definition Creation
// ============================================================================

interface CreateDefinitionResult {
    filePath: string
    created: boolean
}

function createAlgorithmDefinition(
    key: string,
    version: string
): CreateDefinitionResult {
    const registryPath = join(REPUTATION_ALGORITHMS_PATH, 'src', 'registry')
    const keyDir = join(registryPath, key)
    const filePath = join(keyDir, `${version}.json`)

    if (existsSync(filePath)) {
        throw new Error(`Algorithm definition already exists: ${filePath}`)
    }

    mkdirSync(keyDir, { recursive: true })

    const template = createAlgorithmTemplate(key, version)
    const content = JSON.stringify(template, null, 4)

    writeFileSync(filePath, `${content}\n`, 'utf-8')

    return { filePath, created: true }
}

interface CreateActivityResult {
    activityFile: string
    indexFile: string
    indexAction: 'created' | 'updated' | 'unchanged'
}

function createActivityScaffold(algorithmKey: string): CreateActivityResult {
    const activitiesDir = join(TYPESCRIPT_WORKER_PATH, 'src', 'activities')
    const activityFile = join(activitiesDir, `${algorithmKey}.activity.ts`)
    const indexFile = join(activitiesDir, 'index.ts')

    if (existsSync(activityFile)) {
        throw new Error(`Activity file already exists: ${activityFile}`)
    }

    // Generate and write activity scaffold
    const scaffold = generateActivityScaffold(algorithmKey)
    writeFileSync(activityFile, scaffold, 'utf8')

    // Update index file
    const exportLine = `export * from './${algorithmKey}.activity.js';`
    let indexAction: 'created' | 'updated' | 'unchanged'

    if (!existsSync(indexFile)) {
        const content = `/**
 * Export all algorithm activities.
 *
 * Each exported function should match an AlgorithmDefinition.runtime.activity value.
 */
${exportLine}
`
        writeFileSync(indexFile, content, 'utf8')
        indexAction = 'created'
    } else {
        const indexContent = readFileSync(indexFile, 'utf8')

        if (indexContent.includes(exportLine)) {
            indexAction = 'unchanged'
        } else {
            const updatedContent = `${indexContent.trimEnd()}\n${exportLine}\n`
            writeFileSync(indexFile, updatedContent, 'utf8')
            indexAction = 'updated'
        }
    }

    return { activityFile, indexFile, indexAction }
}

// ============================================================================
// Pre-flight Checks
// ============================================================================

interface PreflightResult {
    canProceed: boolean
    errors: string[]
    warnings: string[]
}

function runPreflightChecks(key: string, version: string): PreflightResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if definition would already exist
    const definitionPath = join(
        REPUTATION_ALGORITHMS_PATH,
        'src',
        'registry',
        key,
        `${version}.json`
    )
    if (existsSync(definitionPath)) {
        errors.push(`Algorithm definition already exists: ${definitionPath}`)
    }

    // Check if activity would already exist
    const activityPath = join(
        TYPESCRIPT_WORKER_PATH,
        'src',
        'activities',
        `${key}.activity.ts`
    )
    if (existsSync(activityPath)) {
        errors.push(`Activity file already exists: ${activityPath}`)
    }

    // Check if required directories exist
    if (!existsSync(REPUTATION_ALGORITHMS_PATH)) {
        errors.push(`Package not found: ${REPUTATION_ALGORITHMS_PATH}`)
    }

    if (!existsSync(TYPESCRIPT_WORKER_PATH)) {
        errors.push(`Package not found: ${TYPESCRIPT_WORKER_PATH}`)
    }

    return {
        canProceed: errors.length === 0,
        errors,
        warnings,
    }
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
    console.log('Usage: pnpm algorithm:create <key> <version>')
    console.log('')
    console.log('Creates both an algorithm definition and activity scaffold.')
    console.log('')
    console.log('Arguments:')
    console.log(
        '  key      Algorithm key in snake_case (e.g., voting_engagement)'
    )
    console.log('  version  Semantic version (e.g., 1.0.0)')
    console.log('')
    console.log('Examples:')
    console.log('  pnpm algorithm:create voting_engagement 1.0.0')
    console.log('  pnpm algorithm:create proposal_engagement 2.1.0')
    console.log('  pnpm algorithm:create contribution_score 1.0.0-beta')
    console.log('')
}

async function main(): Promise<void> {
    const args = process.argv.slice(2)

    // Handle help flag
    if (args.includes('--help') || args.includes('-h')) {
        printUsage()
        process.exit(0)
    }

    // Validate arguments
    if (args.length !== 2) {
        console.error('✗ Error: Both key and version are required')
        console.error('')
        printUsage()
        process.exit(1)
    }

    const [key, version] = args

    if (!key || !version) {
        console.error('✗ Error: Both key and version are required')
        console.error('')
        printUsage()
        process.exit(1)
    }

    // Validate key and version format
    const keyValidation = validateKey(key)
    const versionValidation = validateVersion(version)

    const allErrors = [...keyValidation.errors, ...versionValidation.errors]
    if (allErrors.length > 0) {
        console.error('✗ Validation failed:')
        for (const error of allErrors) {
            console.error(`  - ${error}`)
        }
        console.error('')
        console.error(
            'Examples: voting_engagement, proposal_engagement, contribution_score'
        )
        process.exit(1)
    }

    // Run pre-flight checks
    const preflight = runPreflightChecks(key, version)
    if (!preflight.canProceed) {
        console.error('✗ Pre-flight checks failed:')
        for (const error of preflight.errors) {
            console.error(`  - ${error}`)
        }
        process.exit(1)
    }

    // Create algorithm definition
    console.log('Creating algorithm...')
    console.log('')

    try {
        const definitionResult = createAlgorithmDefinition(key, version)
        console.log(`✓ Created algorithm definition:`)
        console.log(`    ${definitionResult.filePath}`)
    } catch (error) {
        console.error(
            `✗ Failed to create algorithm definition: ${
                (error as Error).message
            }`
        )
        process.exit(1)
    }

    // Create activity scaffold
    try {
        const activityResult = createActivityScaffold(key)
        console.log(`✓ Created activity scaffold:`)
        console.log(`    ${activityResult.activityFile}`)
        if (activityResult.indexAction === 'updated') {
            console.log(`✓ Updated activities index`)
        } else if (activityResult.indexAction === 'created') {
            console.log(`✓ Created activities index`)
        }
    } catch (error) {
        console.error(
            `✗ Failed to create activity scaffold: ${(error as Error).message}`
        )
        process.exit(1)
    }

    // Success message
    console.log('')
    console.log('✅ Algorithm created successfully!')
    console.log('')
    console.log('Next steps:')
    console.log(`  1. Edit the algorithm definition to define inputs/outputs:`)
    console.log(
        `     packages/reputation-algorithms/src/registry/${key}/${version}.json`
    )
    console.log('')
    console.log(`  2. Implement the algorithm logic in the activity:`)
    console.log(`     apps/typescript-worker/src/activities/${key}.activity.ts`)
    console.log('')
    console.log('  3. Build and validate:')
    console.log(
        '     pnpm --filter @reputo/reputation-algorithms registry:validate'
    )
    console.log('     pnpm --filter @reputo/reputation-algorithms build')
    console.log('')
}

main().catch((error) => {
    console.error('Unexpected error:', error)
    process.exit(1)
})
