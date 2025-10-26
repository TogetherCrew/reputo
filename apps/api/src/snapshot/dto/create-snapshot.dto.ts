import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class TemporalDto {
  @ApiPropertyOptional({
    description: 'Temporal workflow ID',
    example: 'wf-voting-engagement-abc123',
  })
  @IsString()
  @IsOptional()
  workflowId?: string;

  @ApiPropertyOptional({
    description: 'Temporal workflow run ID',
    example: 'a1b2c3',
  })
  @IsString()
  @IsOptional()
  runId?: string;

  @ApiPropertyOptional({
    description: 'Temporal task queue name',
    example: 'algorithms',
  })
  @IsString()
  @IsOptional()
  taskQueue?: string;
}

export class CreateSnapshotDto {
  @ApiProperty({
    description: 'Reference to the associated AlgorithmPreset',
    example: '66f9c9...',
  })
  @IsMongoId()
  @IsNotEmpty()
  algorithmPreset: string;

  @ApiPropertyOptional({
    description: 'Optional Temporal workflow information',
    type: TemporalDto,
  })
  @ValidateNested()
  @Type(() => TemporalDto)
  @IsOptional()
  temporal?: TemporalDto;

  @ApiPropertyOptional({
    description: 'Algorithm execution outputs',
    example: {},
  })
  @IsOptional()
  outputs?: unknown;
}
