import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type CSVInput, type ReputoSchema, validatePayload } from '@reputo/algorithm-validator';
import type { AlgorithmPreset } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { AlgorithmDefinition, CsvIoItem } from '@reputo/reputation-algorithms';
import { getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import type { FilterQuery } from 'mongoose';
import { throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { StorageService } from '../storage/storage.service';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, ListAlgorithmPresetsQueryDto, UpdateAlgorithmPresetDto } from './dto';

@Injectable()
export class AlgorithmPresetService {
  constructor(
    private readonly repository: AlgorithmPresetRepository,
    private readonly storageService: StorageService,
  ) {}

  async create(createDto: CreateAlgorithmPresetDto) {
    const algorithmDefinition = this.getAlgorithmDefinition(createDto.key, createDto.version);

    this.validatePresetInputs(createDto, algorithmDefinition);
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

  private validatePresetInputs(dto: CreateAlgorithmPresetDto, definition: AlgorithmDefinition): void {
    const reputoSchema = this.convertToReputoSchema(definition);

    const payload: Record<string, unknown> = {};
    for (const input of dto.inputs) {
      payload[input.key] = input.value;
    }

    const result = validatePayload(reputoSchema, payload);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid preset inputs',
        errors: result.errors,
      });
    }
  }

  private convertToReputoSchema(definition: AlgorithmDefinition): ReputoSchema {
    const inputs = definition.inputs.map((input) => {
      if (input.type === 'csv') {
        return this.convertCsvInput(input);
      }
      // For other input types, we need to map them appropriately
      // Currently, AlgorithmDefinition only supports CSV, but this is extensible
      throw new Error(`Unsupported input type: ${input.type}`);
    });

    return {
      key: definition.key,
      name: definition.name,
      category: definition.category,
      description: definition.description,
      version: definition.version,
      inputs,
      outputs: definition.outputs.map((output) => ({
        key: output.key,
        label: output.label || output.key,
        type: output.type,
        entity: output.entity,
        description: output.description,
      })),
    };
  }

  private convertCsvInput(input: CsvIoItem): CSVInput {
    return {
      key: input.key,
      label: input.label || input.key,
      description: input.description,
      type: 'csv',
      required: true, // CSV inputs are typically required
      csv: {
        hasHeader: input.csv.hasHeader ?? true,
        delimiter: input.csv.delimiter ?? ',',
        maxRows: input.csv.maxRows,
        maxBytes: input.csv.maxBytes,
        columns: input.csv.columns.map((column) => ({
          key: column.key,
          type: this.mapColumnType(column.type),
          required: column.required ?? false,
          aliases: column.aliases,
          description: column.description,
          enum: column.enum?.map((val) => String(val)),
        })),
      },
    };
  }

  private mapColumnType(type: string): 'string' | 'number' | 'date' | 'enum' | 'boolean' {
    switch (type) {
      case 'string':
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'enum':
        return 'enum';
      case 'boolean':
        return 'boolean';
      default:
        return 'string';
    }
  }

  private async validateStorageInputs(dto: CreateAlgorithmPresetDto, definition: AlgorithmDefinition): Promise<void> {
    for (const definitionInput of definition.inputs) {
      const isStorageType = definitionInput.type === 'csv';

      if (!isStorageType) {
        continue;
      }

      const presetInput = dto.inputs.find((input) => input.key === definitionInput.key);

      if (presetInput) await this.storageService.getObjectMetadata(presetInput.value as string);
    }
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
