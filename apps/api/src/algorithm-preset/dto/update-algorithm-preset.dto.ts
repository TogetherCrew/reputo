import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAlgorithmPresetDto } from './create-algorithm-preset.dto';

// Omit 'spec' since it's immutable
export class UpdateAlgorithmPresetDto extends PartialType(OmitType(CreateAlgorithmPresetDto, ['spec'] as const)) {}
