#!/usr/bin/env tsx

/**
 * Validation script for checking algorithm definitions and activities are in sync.
 *
 * This script verifies:
 * 1. Every algorithm definition has a corresponding activity export
 * 2. Every activity has a corresponding algorithm definition (optional warning)
 *
 * Usage:
 *   pnpm algorithm:validate
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

// Registry and activities paths
const REGISTRY_PATH = join(REPUTATION_ALGORITHMS_PATH, 'src', 'registry')
const ACTIVITIES_DIR = join(TYPESCRIPT_WORKER_PATH, 'src', 'activities')
const ACTIVITIES_INDEX = join(ACTIVITIES_DIR, 'index.ts')

// ============================================================================
// Registry Discovery
// ============================================================================

interface AlgorithmDefinitionInfo {
    key: string
    versions: string[]
    runtimeActivity: string | null
    runtimeTaskQueue: string | null
}

/**
 * Discover all algorithm definitions from the registry directory.
 */
function discoverRegistryAlgorithms(): Map<string, AlgorithmDefinitionInfo> {
    const algorithms = new Map<string, AlgorithmDefinitionInfo>()

    if (!existsSync(REGISTRY_PATH)) {
        console.error(`✗ Registry path not found: ${REGISTRY_PATH}`)
        return algorithms
    }

    const entries = readdirSync(REGISTRY_PATH)

    for (const entry of entries) {
        const entryPath = join(REGISTRY_PATH, entry)

        // Skip non-directories and generated files
        if (!statSync(entryPath).isDirectory()) {
            continue
        }

        // Skip if entry starts with index or is a hidden directory
        if (entry.startsWith('.') || entry === 'index.gen.ts') {
            continue
        }

        const versions: string[] = []
        let runtimeActivity: string | null = null
        let runtimeTaskQueue: string | null = null

        // Find all version files in the directory
        const versionFiles = readdirSync(entryPath).filter((f) =>
            f.endsWith('.json')
        )

        for (const versionFile of versionFiles) {
            const version = versionFile.replace('.json', '')
            versions.push(version)

            // Parse the definition to get runtime info (use latest version)
            try {
                const content = readFileSync(
                    join(entryPath, versionFile),
                    'utf8'
                )
                const definition = JSON.parse(content)
                if (definition.runtime) {
                    runtimeActivity = definition.runtime.activity || null
                    runtimeTaskQueue = definition.runtime.taskQueue || null
                }
            } catch {
                // Ignore parse errors, just skip runtime extraction
            }
        }

        if (versions.length > 0) {
            algorithms.set(entry, {
                key: entry,
                versions: versions.sort(),
                runtimeActivity,
                runtimeTaskQueue,
            })
        }
    }

    return algorithms
}

// ============================================================================
// Activities Discovery
// ============================================================================

/**
 * Discover all activity exports from the activities index file.
 */
function discoverActivityExports(): Set<string> {
    const exports = new Set<string>()

    if (!existsSync(ACTIVITIES_INDEX)) {
        console.error(`✗ Activities index not found: ${ACTIVITIES_INDEX}`)
        return exports
    }

    const content = readFileSync(ACTIVITIES_INDEX, 'utf8')

    // Match export statements like: export * from './voting_engagement.activity.js';
    const exportPattern =
        /export\s+\*\s+from\s+['"]\.\/([^'"/]+)\.activity\.js['"]/g
    const matches = content.matchAll(exportPattern)

    for (const match of matches) {
        const activityKey = match[1]
        if (activityKey) {
            exports.add(activityKey)
        }
    }

    return exports
}

/**
 * Discover all activity files in the activities directory.
 */
function discoverActivityFiles(): Set<string> {
    const activities = new Set<string>()

    if (!existsSync(ACTIVITIES_DIR)) {
        console.error(`✗ Activities directory not found: ${ACTIVITIES_DIR}`)
        return activities
    }

    const files = readdirSync(ACTIVITIES_DIR)

    for (const file of files) {
        if (file.endsWith('.activity.ts')) {
            const activityKey = file.replace('.activity.ts', '')
            activities.add(activityKey)
        }
    }

    return activities
}

// ============================================================================
// Validation
// ============================================================================

interface ValidationReport {
    errors: string[]
    warnings: string[]
    info: string[]
}

function validateAlgorithms(): ValidationReport {
    const report: ValidationReport = {
        errors: [],
        warnings: [],
        info: [],
    }

    // Discover algorithms and activities
    const registryAlgorithms = discoverRegistryAlgorithms()
    const activityExports = discoverActivityExports()
    const activityFiles = discoverActivityFiles()

    report.info.push(
        `Found ${registryAlgorithms.size} algorithm definition(s) in registry`
    )
    report.info.push(
        `Found ${activityExports.size} activity export(s) in index`
    )
    report.info.push(
        `Found ${activityFiles.size} activity file(s) in directory`
    )

    // Check: Every algorithm definition should have a corresponding activity
    for (const [key, info] of registryAlgorithms) {
        const expectedActivity = info.runtimeActivity || key

        // Check if activity file exists
        if (!activityFiles.has(expectedActivity)) {
            report.errors.push(
                `Missing activity file for algorithm "${key}" (expected: ${expectedActivity}.activity.ts)`
            )
        }

        // Check if activity is exported
        if (!activityExports.has(expectedActivity)) {
            report.errors.push(
                `Missing activity export for algorithm "${key}" (expected export from: ./${expectedActivity}.activity.js)`
            )
        }

        // Warn if runtime.activity doesn't match key
        if (info.runtimeActivity && info.runtimeActivity !== key) {
            report.warnings.push(
                `Algorithm "${key}" has different runtime.activity "${info.runtimeActivity}" - ensure activity function is named correctly`
            )
        }
    }

    // Check: Every activity file should have a corresponding definition (warning only)
    for (const activityKey of activityFiles) {
        // Skip utility files
        if (activityKey === 'utils' || activityKey === 'index') {
            continue
        }

        const hasDefinition = Array.from(registryAlgorithms.values()).some(
            (info) =>
                info.key === activityKey || info.runtimeActivity === activityKey
        )

        if (!hasDefinition) {
            report.warnings.push(
                `Activity file "${activityKey}.activity.ts" has no corresponding algorithm definition`
            )
        }
    }

    // Check: Every activity file should be exported
    for (const activityKey of activityFiles) {
        // Skip utility files
        if (activityKey === 'utils' || activityKey === 'index') {
            continue
        }

        if (!activityExports.has(activityKey)) {
            report.errors.push(
                `Activity file "${activityKey}.activity.ts" is not exported in index.ts`
            )
        }
    }

    return report
}

// ============================================================================
// CLI
// ============================================================================

function printReport(report: ValidationReport): void {
    console.log('Algorithm Validation Report')
    console.log('===========================')
    console.log('')

    // Print info
    for (const info of report.info) {
        console.log(`ℹ ${info}`)
    }
    console.log('')

    // Print errors
    if (report.errors.length > 0) {
        console.log('Errors:')
        for (const error of report.errors) {
            console.log(`  ✗ ${error}`)
        }
        console.log('')
    }

    // Print warnings
    if (report.warnings.length > 0) {
        console.log('Warnings:')
        for (const warning of report.warnings) {
            console.log(`  ⚠ ${warning}`)
        }
        console.log('')
    }

    // Summary
    if (report.errors.length === 0 && report.warnings.length === 0) {
        console.log('✅ All algorithms and activities are in sync!')
    } else if (report.errors.length === 0) {
        console.log(`✅ No errors found (${report.warnings.length} warning(s))`)
    } else {
        console.log(
            `❌ Found ${report.errors.length} error(s) and ${report.warnings.length} warning(s)`
        )
    }
}

function printUsage(): void {
    console.log('Usage: pnpm algorithm:validate')
    console.log('')
    console.log(
        'Validates that algorithm definitions and activities are in sync.'
    )
    console.log('')
    console.log('Checks:')
    console.log(
        '  - Every algorithm definition has a corresponding activity file'
    )
    console.log(
        '  - Every algorithm definition has a corresponding activity export'
    )
    console.log('  - Every activity file is exported in index.ts')
    console.log(
        '  - Every activity file has a corresponding definition (warning)'
    )
    console.log('')
}

function main(): void {
    const args = process.argv.slice(2)

    // Handle help flag
    if (args.includes('--help') || args.includes('-h')) {
        printUsage()
        process.exit(0)
    }

    // Run validation
    const report = validateAlgorithms()
    printReport(report)

    // Exit with error code if there are errors
    if (report.errors.length > 0) {
        process.exit(1)
    }
}

main()
