import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { validateCSVContent, validatePayload } from '@reputo/algorithm-validator';
import type { AlgorithmPreset, Snapshot } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import { type AlgorithmDefinition, type CsvIoItem, getAlgorithmDefinition } from '@reputo/reputation-algorithms';
import type { StorageMetadata } from '@reputo/storage';
import type { Connection, FilterQuery } from 'mongoose';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CSVValidationException, type StorageInputValidationError, throwNotFoundError } from '../shared/exceptions';
import { pick } from '../shared/utils';
import { SnapshotRepository } from '../snapshot/snapshot.repository';
import { StorageService } from '../storage/storage.service';
import { TemporalService } from '../temporal';
import { AlgorithmPresetRepository } from './algorithm-preset.repository';
import type { CreateAlgorithmPresetDto, ListAlgorithmPresetsQueryDto, UpdateAlgorithmPresetDto } from './dto';

@Injectable()
export class AlgorithmPresetService {
  private readonly storageMaxSizeBytes: number;
  private readonly storageContentTypeAllowlist: string;

  constructor(
    @InjectPinoLogger(AlgorithmPresetService.name)
    private readonly logger: PinoLogger,
    private readonly repository: AlgorithmPresetRepository,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => SnapshotRepository))
    private readonly snapshotRepository: SnapshotRepository,
    private readonly temporalService: TemporalService,
    @InjectConnection() private readonly connection: Connection,
    configService: ConfigService,
  ) {
    this.storageMaxSizeBytes = configService.get<number>('storage.maxSizeBytes') as number;
    this.storageContentTypeAllowlist = configService.get<string>('storage.contentTypeAllowlist') as string;
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

      const metadata = await this.storageService.getObjectMetadata(storageKey);
      const metadataErrors = this.validateStorageMetadata(metadata, csvInput);
      inputErrors.push(...metadataErrors);

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

  private validateStorageMetadata(metadata: StorageMetadata, csvInput: CsvIoItem): string[] {
    const errors: string[] = [];
    const allowedTypes = this.storageContentTypeAllowlist.split(',').map((t) => t.trim());

    if (!allowedTypes.includes(metadata.contentType)) {
      errors.push(`Invalid content type: ${metadata.contentType}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    if (metadata.size > this.storageMaxSizeBytes) {
      errors.push(`File size ${metadata.size} bytes exceeds API limit of ${this.storageMaxSizeBytes} bytes`);
    }
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
    const algorithmPreset = await this.repository.findById(id);
    if (!algorithmPreset) {
      throwNotFoundError(id, MODEL_NAMES.ALGORITHM_PRESET);
    }
    const snapshots: Snapshot[] = await this.snapshotRepository.find({
      algorithmPreset: id,
    });
    await this.temporalService.cancelSnapshotWorkflows(snapshots);
    await this.deletePresetWithSnapshots(id, snapshots.length);
  }

  private async deletePresetWithSnapshots(presetId: string, snapshotCount: number): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        if (snapshotCount > 0) {
          await this.snapshotRepository.deleteMany({ algorithmPreset: presetId }, session);
          this.logger.info(`Deleted ${snapshotCount} snapshots for algorithm preset ${presetId}`);
        }
        await this.repository.deleteById(presetId, session);
        this.logger.info(`Deleted algorithm preset ${presetId}`);
      });
    } finally {
      await session.endSession();
    }
  }
}
