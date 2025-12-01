/**
 * Core validation logic that runs identically on both client and server
 * This ensures consistency across the entire application
 */

import { z } from 'zod'
import type { CSVConfig, Input, ReputoSchema, ValidationResult } from './types'

/**
 * Validates data against a ReputoSchema
 * This function can run on both client and server
 */
export function validatePayload(
    schema: ReputoSchema,
    payload: unknown
): ValidationResult {
    try {
        const zodSchema = buildZodSchema(schema)
        const result = zodSchema.safeParse(payload)

        if (result.success) {
            return {
                success: true,
                data: result.data,
            }
        } else {
            return {
                success: false,
                errors: result.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                })),
            }
        }
    } catch (error) {
        return {
            success: false,
            errors: [
                {
                    field: '_schema',
                    message: `Validation error: ${
                        error instanceof Error ? error.message : 'Unknown error'
                    }`,
                },
            ],
        }
    }
}

/**
 * Builds a Zod schema from a ReputoSchema definition
 * This is the core validation logic used everywhere
 */
export function buildZodSchema(reputoSchema: ReputoSchema) {
    const shape: Record<string, z.ZodTypeAny> = {}

    reputoSchema.inputs.forEach((input) => {
        shape[input.key] = buildFieldSchema(input)
    })

    return z.object(shape)
}

/**
 * Builds a Zod schema for a single input field
 * Each field type has specific validation rules
 */
function buildFieldSchema(input: Input): z.ZodTypeAny {
    let schema: z.ZodTypeAny

    switch (input.type) {
        case 'text':
            schema = z.string()
            if (input.minLength) {
                schema = (schema as z.ZodString).min(
                    input.minLength,
                    `${input.label} must be at least ${input.minLength} characters`
                )
            }
            if (input.maxLength) {
                schema = (schema as z.ZodString).max(
                    input.maxLength,
                    `${input.label} must be at most ${input.maxLength} characters`
                )
            }
            if (input.pattern) {
                schema = (schema as z.ZodString).regex(
                    new RegExp(input.pattern),
                    `${input.label} must match the required pattern`
                )
            }
            break

        case 'number':
            schema = z.number()
            if (input.min !== undefined) {
                schema = (schema as z.ZodNumber).min(
                    input.min,
                    `${input.label} must be at least ${input.min}`
                )
            }
            if (input.max !== undefined) {
                schema = (schema as z.ZodNumber).max(
                    input.max,
                    `${input.label} must be at most ${input.max}`
                )
            }
            break

        case 'boolean':
            schema = z.boolean()
            break

        case 'date':
            schema = z
                .string()
                .refine(
                    (val) => !Number.isNaN(Date.parse(val)),
                    `${input.label} must be a valid date`
                )
            if (input.minDate) {
                const minDate = new Date(input.minDate)
                schema = schema.refine(
                    (val) => new Date(val as string) >= minDate,
                    `${input.label} must be after ${input.minDate}`
                )
            }
            if (input.maxDate) {
                const maxDate = new Date(input.maxDate)
                schema = schema.refine(
                    (val) => new Date(val as string) <= maxDate,
                    `${input.label} must be before ${input.maxDate}`
                )
            }
            break

        case 'enum':
            schema = z.enum(input.enum as [string, ...string[]])
            break

        case 'csv':
            // For server validation, CSV is validated as a string (filename or data)
            // Client-side uses File object validation
            if (typeof window === 'undefined') {
                // Server-side: validate as string
                schema = z.string().min(1, `${input.label} is required`)
            } else {
                // Client-side: accept either a File (for local validation) OR a string storage key (after upload)
                schema = z.union([
                    buildCSVSchema(input.csv, input.label),
                    z.string().min(1, `${input.label} is required`),
                ])
            }
            break

        case 'slider':
            schema = z.number().min(input.min).max(input.max)
            break

        default:
            schema = z.string()
    }

    // Make optional if not required
    if (input.required === false) {
        schema = schema.optional()
    }

    return schema
}

/**
 * Builds a Zod schema for CSV file validation (client-side only)
 */
function buildCSVSchema(csvConfig: CSVConfig, label: string): z.ZodTypeAny {
    return z
        .instanceof(File, { message: `${label} must be a file` })
        .refine(
            (file) => file.type === 'text/csv' || file.name.endsWith('.csv'),
            {
                message: `${label} must be a CSV file`,
            }
        )
        .refine(
            (file) => !csvConfig.maxBytes || file.size <= csvConfig.maxBytes,
            {
                message: `${label} must be smaller than ${
                    csvConfig.maxBytes ? csvConfig.maxBytes / 1024 / 1024 : 0
                }MB`,
            }
        )
}

/**
 * Validates CSV content against column definitions
 * Can be used on both client and server
 */
export async function validateCSVContent(
    file: File | string,
    csvConfig: CSVConfig
): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    const normalizeKey = (s: string) =>
        s
            .toLowerCase()
            .replace(/^\uFEFF/, '')
            .replace(/\u00a0/g, ' ') // NBSP to space
            .trim()
            .replace(/^["']+|["']+$/g, '') // strip wrapping quotes
            .replace(/[\s\-\u2011\u2013\u2014]+/g, '_') // spaces and dashes → underscore
            .replace(/_+/g, '_') // collapse
            .replace(/^_+|_+$/g, '') // trim underscores

    try {
        // Read file text (or raw string), normalize BOM and line endings
        const isStringInput = typeof file === 'string'
        const fileInfo = isStringInput
            ? { kind: 'string' }
            : {
                  kind: 'file',
                  name: (file as File).name,
                  type: (file as File).type,
                  size: (file as File).size,
              }

        let text = isStringInput
            ? (file as string)
            : await (file as File).text()
        const hadBom = text.startsWith('\uFEFF')
        text = text.replace(/^\uFEFF/, '') // strip UTF-8 BOM if present
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        const rawLines = text.split('\n')
        const lines = rawLines.filter((line) => line.trim().length > 0)

        // Check max rows
        const dataLines = csvConfig.hasHeader ? lines.slice(1) : lines
        if (csvConfig.maxRows && dataLines.length > csvConfig.maxRows) {
            errors.push(
                `CSV has ${dataLines.length} rows, but maximum is ${csvConfig.maxRows}`
            )
        }

        // Parse header
        const headerLine = csvConfig.hasHeader ? lines[0] : null
        if (!headerLine && csvConfig.hasHeader) {
            errors.push('CSV is missing header row')
            return { valid: false, errors }
        }

        // Detect delimiter (prefer configured, but fall back if header doesn't split)
        const candidateDelimiters = [
            csvConfig.delimiter,
            ',',
            ';',
            '\t',
            '|',
        ].filter((d, idx, arr) => arr.indexOf(d) === idx)
        let delimiter = csvConfig.delimiter
        if (headerLine) {
            let bestSplit = headerLine.split(delimiter)
            if (bestSplit.length <= 1) {
                for (const cand of candidateDelimiters) {
                    const split = headerLine.split(cand)
                    if (split.length > bestSplit.length) {
                        bestSplit = split
                        delimiter = cand
                    }
                }
            }
        }

        const headers = headerLine
            ? headerLine.split(delimiter).map((h) => h)
            : []
        const headersSanitized = headers.map((h) =>
            h
                .replace(/^\uFEFF/, '')
                .replace(/\u00a0/g, ' ')
                .trim()
                .replace(/^["']+|["']+$/g, '')
        )
        const headersLower = headersSanitized.map((h) => h.toLowerCase())
        const headersNormalized = headersSanitized.map((h) => normalizeKey(h))

        // Debug logs
        try {
            // Use groupCollapsed to avoid noisy console
            console.groupCollapsed?.('[CSV Validation] Debug')
            console.log?.('Input', fileInfo)
            console.log?.('Had BOM', hadBom)
            console.log?.('Configured delimiter', csvConfig.delimiter)
            console.log?.('Chosen delimiter', delimiter)
            console.log?.('Candidate delimiters', candidateDelimiters)
            console.log?.(
                'Lines count (raw/non-empty)',
                rawLines.length,
                '/',
                lines.length
            )
            console.log?.(
                'Header line (first 200 chars)',
                headerLine?.slice(0, 200)
            )
            console.log?.('Headers (raw)', headers)
            console.log?.('Headers (sanitized)', headersSanitized)
            console.log?.('Headers (lower)', headersLower)
            console.log?.('Headers (normalized)', headersNormalized)
            console.log?.(
                'Required columns',
                csvConfig.columns.filter((c) => c.required !== false)
            )
        } catch {}

        // Validate required columns
        const requiredColumns = csvConfig.columns.filter(
            (col) => col.required !== false
        )

        for (const column of requiredColumns) {
            const candidateKeys = [column.key, ...(column.aliases || [])]
            const candidateLower = candidateKeys.map((k) => k.toLowerCase())
            const candidateNormalized = candidateKeys.map((k) =>
                normalizeKey(k)
            )
            const found =
                candidateLower.some((k) => headersLower.includes(k)) ||
                candidateNormalized.some((k) => headersNormalized.includes(k))

            // Debug each required column resolution
            try {
                console.log?.('[CSV Validation] Column check', {
                    column: column.key,
                    aliases: column.aliases,
                    searchedLower: candidateLower,
                    searchedNormalized: candidateNormalized,
                    found,
                })
            } catch {}

            if (!found) {
                errors.push(
                    `Missing required column: ${column.key}${
                        column.aliases?.length
                            ? ` (or aliases: ${column.aliases.join(', ')})`
                            : ''
                    }`
                )
            }
        }

        // Validate at least one data row
        if (dataLines.length === 0) {
            errors.push('CSV must contain at least one data row')
        }

        // Sample validate first few rows
        const sampleSize = Math.min(5, dataLines.length)
        for (let i = 0; i < sampleSize; i++) {
            const values = dataLines[i].split(delimiter)

            if (values.length !== headers.length) {
                errors.push(
                    `Row ${i + 1} has ${values.length} values but header has ${
                        headers.length
                    } columns`
                )
            }

            // Validate enum columns
            csvConfig.columns
                .filter((col) => col.type === 'enum')
                .forEach((col) => {
                    const colIndex = headersLower.findIndex((h) =>
                        [col.key, ...(col.aliases || [])]
                            .map((k) => k.toLowerCase())
                            .includes(h)
                    )
                    if (colIndex >= 0) {
                        const value = values[colIndex]
                            ?.trim()
                            .replace(/^["']+|["']+$/g, '')
                        if (value && col.enum && !col.enum.includes(value)) {
                            errors.push(
                                `Row ${i + 1}, column ${
                                    col.key
                                }: "${value}" is not a valid value. Expected one of: ${col.enum.join(
                                    ', '
                                )}`
                            )
                        }
                    }
                })
        }

        // Emit a single easy-to-copy summary object as well
        try {
            const missing = errors.filter((e) =>
                e.startsWith('Missing required column:')
            )
            const proposalIdx = headersNormalized.findIndex((h) =>
                ['proposal_id', 'proposalid', 'proposal', 'question'].includes(
                    h
                )
            )
            const voteIdx = headersNormalized.findIndex((h) =>
                ['vote', 'votes'].includes(h)
            )
            console.info('[CSV Validation] Summary', {
                delimiter,
                headerLine,
                headersRaw: headers,
                headersSanitized,
                headersNormalized,
                missing,
                sampleRow0: dataLines[0],
                proposalColumnIndex: proposalIdx,
                voteColumnIndex: voteIdx,
            })
        } catch {}

        try {
            console.log?.('[CSV Validation] Errors', errors)
            console.groupEnd?.()
        } catch {}
    } catch (error) {
        errors.push(
            `Failed to parse CSV: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`
        )
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Type inference helper
 */
export type InferSchemaType = z.infer<ReturnType<typeof buildZodSchema>>
