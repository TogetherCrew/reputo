/**
 * CSV content validation logic
 * Validates CSV structure and column requirements
 * Works in both browser (File) and Node.js (string/Buffer) environments
 */

import type { CSVConfig, CSVValidationResult } from './types.js';

/**
 * Normalizes a string key for comparison
 * Handles BOM, NBSP, spaces, dashes, and quotes
 */
function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/^\uFEFF/, '')
    .replace(/\u00a0/g, ' ') // NBSP to space
    .trim()
    .replace(/^["']+|["']+$/g, '') // strip wrapping quotes
    .replace(/[\s\-\u2011\u2013\u2014]+/g, '_') // spaces and dashes → underscore
    .replace(/_+/g, '_') // collapse
    .replace(/^_+|_+$/g, ''); // trim underscores
}

/**
 * Reads text content from various input types
 * Supports File (browser), string, and Buffer (Node.js)
 */
async function readContent(file: File | string | Buffer): Promise<{ text: string; fileInfo: Record<string, unknown> }> {
  if (typeof file === 'string') {
    return { text: file, fileInfo: { kind: 'string' } };
  }

  if (Buffer.isBuffer(file)) {
    return { text: file.toString('utf-8'), fileInfo: { kind: 'buffer' } };
  }

  // Browser File object
  return {
    text: await file.text(),
    fileInfo: {
      kind: 'file',
      name: file.name,
      type: file.type,
      size: file.size,
    },
  };
}

/**
 * Validates CSV content against column definitions
 * Can be used on both client and server
 *
 * @param file - File object (browser), string content, or Buffer (Node.js)
 * @param csvConfig - Configuration defining expected columns and constraints
 * @returns Validation result with any errors found
 */
export async function validateCSVContent(
  file: File | string | Buffer,
  csvConfig: CSVConfig,
): Promise<CSVValidationResult> {
  const errors: string[] = [];

  try {
    const { text: rawText, fileInfo } = await readContent(file);

    // Normalize BOM and line endings
    const hadBom = rawText.startsWith('\uFEFF');
    let text = rawText.replace(/^\uFEFF/, ''); // strip UTF-8 BOM if present
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = text.split('\n');
    const lines = rawLines.filter((line) => line.trim().length > 0);

    // Check max rows
    const dataLines = csvConfig.hasHeader ? lines.slice(1) : lines;
    if (csvConfig.maxRows !== undefined && dataLines.length > csvConfig.maxRows) {
      errors.push(`CSV has ${dataLines.length} rows, but maximum is ${csvConfig.maxRows}`);
    }

    // Parse header
    const headerLine = csvConfig.hasHeader ? lines[0] : null;
    if (!headerLine && csvConfig.hasHeader) {
      errors.push('CSV is missing header row');
      return { valid: false, errors };
    }

    // Detect delimiter (prefer configured, but fall back if header doesn't split)
    const candidateDelimiters = [csvConfig.delimiter, ',', ';', '\t', '|'].filter(
      (d, idx, arr) => d !== undefined && arr.indexOf(d) === idx,
    );
    let delimiter = csvConfig.delimiter;
    if (headerLine) {
      let bestSplit = headerLine.split(delimiter);
      if (bestSplit.length <= 1) {
        for (const cand of candidateDelimiters) {
          const split = headerLine.split(cand);
          if (split.length > bestSplit.length) {
            bestSplit = split;
            delimiter = cand;
          }
        }
      }
    }

    const headers = headerLine ? headerLine.split(delimiter) : [];
    const headersSanitized = headers.map((h) =>
      h
        .replace(/^\uFEFF/, '')
        .replace(/\u00a0/g, ' ')
        .trim()
        .replace(/^["']+|["']+$/g, ''),
    );
    const headersLower = headersSanitized.map((h) => h.toLowerCase());
    const headersNormalized = headersSanitized.map((h) => normalizeKey(h));

    // Debug logs (only in development/debug mode)
    if (process.env['NODE_ENV'] === 'development') {
      console.groupCollapsed?.('[CSV Validation] Debug');
      console.log?.('Input', fileInfo);
      console.log?.('Had BOM', hadBom);
      console.log?.('Configured delimiter', csvConfig.delimiter);
      console.log?.('Chosen delimiter', delimiter);
      console.log?.('Candidate delimiters', candidateDelimiters);
      console.log?.('Lines count (raw/non-empty)', rawLines.length, '/', lines.length);
      console.log?.('Header line (first 200 chars)', headerLine?.slice(0, 200));
      console.log?.('Headers (raw)', headers);
      console.log?.('Headers (sanitized)', headersSanitized);
      console.log?.('Headers (lower)', headersLower);
      console.log?.('Headers (normalized)', headersNormalized);
      console.log?.(
        'Required columns',
        csvConfig.columns.filter((c) => c.required !== false),
      );
      console.groupEnd?.();
    }

    // Validate required columns
    const requiredColumns = csvConfig.columns.filter((col) => col.required !== false);

    for (const column of requiredColumns) {
      const candidateKeys = [column.key, ...(column.aliases ?? [])];
      const candidateLower = candidateKeys.map((k) => k.toLowerCase());
      const candidateNormalized = candidateKeys.map((k) => normalizeKey(k));
      const found =
        candidateLower.some((k) => headersLower.includes(k)) ||
        candidateNormalized.some((k) => headersNormalized.includes(k));

      if (!found) {
        errors.push(
          `Missing required column: ${column.key}${
            column.aliases?.length ? ` (or aliases: ${column.aliases.join(', ')})` : ''
          }`,
        );
      }
    }

    // Validate at least one data row
    if (dataLines.length === 0) {
      errors.push('CSV must contain at least one data row');
    }

    // Sample validate first few rows
    const sampleSize = Math.min(5, dataLines.length);
    for (let i = 0; i < sampleSize; i++) {
      const row = dataLines[i];
      if (row === undefined) continue;

      const values = row.split(delimiter);

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1} has ${values.length} values but header has ${headers.length} columns`);
      }

      // Validate enum columns
      for (const col of csvConfig.columns.filter((c) => c.type === 'enum')) {
        const colIndex = headersLower.findIndex((h) =>
          [col.key, ...(col.aliases ?? [])].map((k) => k.toLowerCase()).includes(h),
        );
        if (colIndex >= 0) {
          const value = values[colIndex]?.trim().replace(/^["']+|["']+$/g, '');
          if (value && col.enum && !col.enum.includes(value)) {
            errors.push(
              `Row ${i + 1}, column ${col.key}: "${value}" is not a valid value. Expected one of: ${col.enum.join(', ')}`,
            );
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
