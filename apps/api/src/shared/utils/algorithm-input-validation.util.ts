import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validateCSVContent, validateJSONContent, validatePayload } from '@reputo/algorithm-validator';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function validateTokenValueOverTimeWalletCoverage(
  definition: AlgorithmDefinition,
  payload: Record<string, unknown>,
  parsedJsonInputs: Record<string, unknown>,
): void {
  if (definition.key !== 'token_value_over_time') {
    return;
  }

  const selectedAssets = payload.selected_assets;
  const walletsInput = parsedJsonInputs.wallets;
  if (!Array.isArray(selectedAssets) || !isRecord(walletsInput) || !isRecord(walletsInput.wallets)) {
    return;
  }

  const selectedChains = [
    ...new Set(selectedAssets.map((item) => (isRecord(item) ? item.chain : undefined)).filter(Boolean)),
  ];
  const walletsByChain = walletsInput.wallets;
  const missingChains = selectedChains.filter((chain): chain is string => {
    if (typeof chain !== 'string') {
      return false;
    }
    const wallets = walletsByChain[chain];
    return !Array.isArray(wallets) || wallets.length === 0;
  });

  if (missingChains.length > 0) {
    throw new StorageInputValidationException([
      {
        inputKey: 'wallets',
        errors: [`Wallet JSON is missing wallet addresses for selected chain(s): ${missingChains.join(', ')}`],
      },
    ]);
  }
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
  const payload = buildAlgorithmPayload(params.inputs);
  const result = validatePayload(params.definition, payload);

  if (!result.success) {
    throw new BadRequestException({
      message: 'Invalid algorithm inputs',
      errors: result.errors,
    });
  }

  const validationErrors: StorageInputValidationError[] = [];
  const parsedJsonInputs: Record<string, unknown> = {};

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

    const fileBuffer = await params.storageService.getObject(presetInput.value);

    if (definitionInput.type === 'csv') {
      const csvResult = await validateCSVContent(fileBuffer, definitionInput.csv);
      if (!csvResult.valid) {
        inputErrors.push(...csvResult.errors);
      }
    }

    if (definitionInput.type === 'json') {
      const jsonResult = await validateJSONContent(fileBuffer, definitionInput.json);
      if (!jsonResult.valid) {
        inputErrors.push(...jsonResult.errors);
      } else {
        parsedJsonInputs[definitionInput.key] = JSON.parse(fileBuffer.toString('utf-8'));
      }
    }

    if (inputErrors.length > 0) {
      validationErrors.push({
        inputKey: definitionInput.key,
        errors: inputErrors,
      });
    }
  }

  if (validationErrors.length > 0) {
    throw new StorageInputValidationException(validationErrors);
  }

  validateTokenValueOverTimeWalletCoverage(params.definition, payload, parsedJsonInputs);
}
