import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateCSVContent, validatePayload } from '@reputo/algorithm-validator';
import type { AlgorithmPreset } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import { type AlgorithmDefinition, type CsvIoItem, getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import type { StorageMetadata } from '@reputo/storage';
import type { FilterQuery } from 'mongoose';
import { CSVValidationException, type StorageInputValidationError, throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { StorageService } from '../storage/storage.service';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, ListAlgorithmPresetsQueryDto, UpdateAlgorithmPresetDto } from './dto';

/** Storage configuration values from environment */
interface StorageConfig {
  maxSizeBytes: number;
  contentTypeAllowlist: string;
}

@Injectable()
export class AlgorithmPresetService {
  private readonly storageConfig: StorageConfig;

  constructor(
    private readonly repository: AlgorithmPresetRepository,
    private readonly storageService: StorageService,
    configService: ConfigService,
  ) {
    this.storageConfig = {
      maxSizeBytes: configService.get<number>('storage.maxSizeBytes') as number,
      contentTypeAllowlist: configService.get<string>('storage.contentTypeAllowlist') as string,
    };
  }

  async create(createDto: CreateAlgorithmPresetDto) {
    const algorithmDefinition = this.getAlgorithmDefinition(createDto.key, createDto.version);

    this.validateAlgorithmPresetInputs(createDto, algorithmDefinition);
    await this.validateStorageInputs(createDto, algorithmDefinition);

    return this.repository.create(createDto);
  }

  private getAlgorithmDefinition(key: string, version: string): AlgorithmDefinition {
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

  private validateAlgorithmPresetInputs(dto: CreateAlgorithmPresetDto, definition: AlgorithmDefinition): void {
    const payload: Record<string, unknown> = {};
    for (const input of dto.inputs) {
      payload[input.key] = input.value;
    }

    const result = validatePayload(definition, payload);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid preset inputs',
        errors: result.errors,
      });
    }
  }

  /**
   * Validates all storage-backed inputs (CSV files) in the preset.
   * Performs metadata validation and CSV content validation.
   * Collects all errors across all inputs before throwing.
   */
  private async validateStorageInputs(dto: CreateAlgorithmPresetDto, definition: AlgorithmDefinition): Promise<void> {
    const validationErrors: StorageInputValidationError[] = [];

    for (const definitionInput of definition.inputs) {
      if (definitionInput.type !== 'csv') {
        continue;
      }

      const presetInput = dto.inputs.find((input) => input.key === definitionInput.key);

      if (!presetInput) {
        continue;
      }

      const storageKey = presetInput.value as string;
      const csvInput = definitionInput as CsvIoItem;
      const inputErrors: string[] = [];

      // Get and validate metadata
      const metadata = await this.storageService.getObjectMetadata(storageKey);
      const metadataErrors = this.validateStorageMetadata(metadata, csvInput);
      inputErrors.push(...metadataErrors);

      // Fetch file and validate CSV content
      const fileBuffer = await this.storageService.getObject(storageKey);
      const csvResult = await validateCSVContent(fileBuffer, csvInput.csv);
      if (!csvResult.valid) {
        inputErrors.push(...csvResult.errors);
      }

      if (inputErrors.length > 0) {
        validationErrors.push({
          inputKey: definitionInput.key,
          errors: inputErrors,
        });
      }
    }

    if (validationErrors.length > 0) {
      throw new CSVValidationException(validationErrors);
    }
  }

  /**
   * Validates storage metadata against API config and algorithm definition limits.
   * @returns Array of error messages (empty if valid)
   */
  private validateStorageMetadata(metadata: StorageMetadata, csvInput: CsvIoItem): string[] {
    const errors: string[] = [];
    const allowedTypes = this.storageConfig.contentTypeAllowlist.split(',').map((t) => t.trim());

    // Validate content type against API config allowlist
    if (!allowedTypes.includes(metadata.contentType)) {
      errors.push(`Invalid content type: ${metadata.contentType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate size against API config limit
    if (metadata.size > this.storageConfig.maxSizeBytes) {
      errors.push(`File size ${metadata.size} bytes exceeds API limit of ${this.storageConfig.maxSizeBytes} bytes`);
    }

    // Validate size against algorithm definition's maxBytes (if specified)
    if (csvInput.csv.maxBytes !== undefined && metadata.size > csvInput.csv.maxBytes) {
      errors.push(`File size ${metadata.size} bytes exceeds algorithm limit of ${csvInput.csv.maxBytes} bytes`);
    }

    return errors;
  }

  list(queryDto: ListAlgorithmPresetsQueryDto) {
    const filter: FilterQuery<AlgorithmPreset> = pick(queryDto, ['key', 'version']);
    const paginateOptions = pick(queryDto, ['page', 'limit', 'sortBy']);
    return this.repository.findAll(filter, paginateOptions);
  }

  async getById(id: string) {
    const algorithmPreset = await this.repository.findById(id);

    if (!algorithmPreset) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
    return algorithmPreset;
  }

  async updateById(id: string, updateDto: UpdateAlgorithmPresetDto) {
    const updatedAlgorithmPreset = await this.repository.updateById(id, updateDto);
    if (!updatedAlgorithmPreset) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
    return updatedAlgorithmPreset;
  }

  async deleteById(id: string) {
    const result = await this.repository.deleteById(id);
    if (!result) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
  }
}
