import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validateAlgorithmPreset } from '@reputo/algorithm-validator';
import {
  type AlgorithmDefinition,
  type CsvIoItem,
  getAlgorithmDefinition,
  type JsonIoItem,
} from '@reputo/reputation-algorithms';
import type { StorageMetadata } from '@reputo/storage';
import type { StorageService } from '../../storage/storage.service';
import { type StorageInputValidationError, StorageInputValidationException } from '../exceptions';

export interface AlgorithmInputValue {
  key: string;
  value?: unknown;
}

function getStorageInputFileLabel(input: CsvIoItem | JsonIoItem): string {
  return input.label ?? input.key;
}

function isCsvMetadata(metadata: StorageMetadata): boolean {
  const normalizedContentType = metadata.contentType.toLowerCase();
  if (normalizedContentType === 'application/json') {
    return false;
  }
  return (
    metadata.ext.toLowerCase() === 'csv' ||
    normalizedContentType === 'text/csv' ||
    normalizedContentType === 'text/plain'
  );
}

function isJsonMetadata(metadata: StorageMetadata): boolean {
  const normalizedContentType = metadata.contentType.toLowerCase();
  if (normalizedContentType === 'text/csv') {
    return false;
  }
  return metadata.ext.toLowerCase() === 'json' || normalizedContentType === 'application/json';
}

function validateStorageMetadata(
  metadata: StorageMetadata,
  input: CsvIoItem | JsonIoItem,
  storageMaxSizeBytes: number,
  storageContentTypeAllowlist: string,
): string[] {
  const errors: string[] = [];
  const allowedTypes = storageContentTypeAllowlist.split(',').map((type) => type.trim());
  const label = getStorageInputFileLabel(input);

  if (!allowedTypes.includes(metadata.contentType)) {
    errors.push(`Invalid content type: ${metadata.contentType}. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (metadata.size > storageMaxSizeBytes) {
    errors.push(`File size ${metadata.size} bytes exceeds API limit of ${storageMaxSizeBytes} bytes`);
  }

  if (input.type === 'csv') {
    if (!isCsvMetadata(metadata)) {
      errors.push(`${label} must be a CSV file`);
    }
    if (input.csv.maxBytes !== undefined && metadata.size > input.csv.maxBytes) {
      errors.push(`File size ${metadata.size} bytes exceeds algorithm limit of ${input.csv.maxBytes} bytes`);
    }
  }

  if (input.type === 'json') {
    if (!isJsonMetadata(metadata)) {
      errors.push(`${label} must be a JSON file`);
    }
    if (input.json?.maxBytes !== undefined && metadata.size > input.json.maxBytes) {
      errors.push(`File size ${metadata.size} bytes exceeds algorithm limit of ${input.json.maxBytes} bytes`);
    }
  }

  return errors;
}

export function getAlgorithmDefinitionOrThrow(key: string, version: string): AlgorithmDefinition {
  try {
    const algorithmDefinition = getAlgorithmDefinition({ key, version });
    return JSON.parse(algorithmDefinition) as AlgorithmDefinition;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw new NotFoundException(`Algorithm definition not found: ${key}@${version}`);
    }
    throw error;
  }
}

export function buildAlgorithmPayload(inputs: ReadonlyArray<AlgorithmInputValue>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const input of inputs) {
    payload[input.key] = input.value;
  }

  return payload;
}

export async function validateAlgorithmInputs(params: {
  definition: AlgorithmDefinition;
  inputs: ReadonlyArray<AlgorithmInputValue>;
  storageService: StorageService;
  storageMaxSizeBytes: number;
  storageContentTypeAllowlist: string;
}): Promise<void> {
  const metadataErrors: StorageInputValidationError[] = [];
  const fileContentCache = new Map<string, Buffer>();

  for (const definitionInput of params.definition.inputs) {
    if (definitionInput.type !== 'csv' && definitionInput.type !== 'json') {
      continue;
    }

    const presetInput = params.inputs.find((input) => input.key === definitionInput.key);
    if (!presetInput || typeof presetInput.value !== 'string' || presetInput.value.trim() === '') {
      continue;
    }

    const metadata = await params.storageService.getObjectMetadata(presetInput.value);
    const inputErrors = validateStorageMetadata(
      metadata,
      definitionInput,
      params.storageMaxSizeBytes,
      params.storageContentTypeAllowlist,
    );

    if (inputErrors.length === 0) {
      fileContentCache.set(definitionInput.key, await params.storageService.getObject(presetInput.value));
    }

    if (inputErrors.length > 0) {
      metadataErrors.push({
        inputKey: definitionInput.key,
        errors: inputErrors,
      });
    }
  }

  if (metadataErrors.length > 0) {
    throw new StorageInputValidationException(metadataErrors);
  }

  const validationResult = await validateAlgorithmPreset({
    definition: params.definition,
    preset: {
      key: params.definition.key,
      version: params.definition.version,
      inputs: params.inputs,
    },
    resolveInputContent: async ({ input, value }) => {
      if (typeof value === 'string') {
        const cached = fileContentCache.get(input.key);
        if (cached) {
          return cached;
        }
      }

      return value;
    },
  });

  if (validationResult.success) {
    return;
  }

  const fileInputKeys = new Set(
    params.definition.inputs.filter((input) => input.type === 'csv' || input.type === 'json').map((input) => input.key),
  );

  const storageValidationErrors = new Map<string, string[]>();
  const requestValidationErrors: Array<{ field: string; message: string; code?: string }> = [];

  for (const error of validationResult.errors ?? []) {
    if ((error.source === 'file' || error.source === 'rule') && fileInputKeys.has(error.field)) {
      const messages = storageValidationErrors.get(error.field) ?? [];
      messages.push(error.message);
      storageValidationErrors.set(error.field, messages);
      continue;
    }

    requestValidationErrors.push({
      field: error.field,
      message: error.message,
      code: error.code,
    });
  }

  if (requestValidationErrors.length > 0) {
    throw new BadRequestException({
      message: 'Invalid algorithm inputs',
      errors: requestValidationErrors,
    });
  }

  if (storageValidationErrors.size > 0) {
    throw new StorageInputValidationException(
      [...storageValidationErrors.entries()].map(([inputKey, errors]) => ({
        inputKey,
        errors,
      })),
    );
  }
}
