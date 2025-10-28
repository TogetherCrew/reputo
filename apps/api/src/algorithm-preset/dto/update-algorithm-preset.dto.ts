import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAlgorithmPresetDto } from './create-algorithm-preset.dto';

export class UpdateAlgorithmPresetDto extends PartialType(
  OmitType(CreateAlgorithmPresetDto, ['key', 'version'] as const),
) {}
