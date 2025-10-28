import { ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_STATUS, SnapshotStatus } from '@reputo/database';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto';

export class ListSnapshotsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by execution status',
    enum: SNAPSHOT_STATUS,
    example: 'completed',
  })
  @IsEnum(SNAPSHOT_STATUS)
  @IsOptional()
  status?: SnapshotStatus;

  @ApiPropertyOptional({
    description: 'Filter by AlgorithmPreset ID',
    example: '66f9c9...',
  })
  @IsMongoId()
  @IsOptional()
  algorithmPreset?: string;

  @ApiPropertyOptional({
    description: 'Filter by algorithm key',
    example: 'voting_engagement',
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    description: 'Filter by algorithm version',
    example: '1.0.0',
  })
  @IsString()
  @IsOptional()
  version?: string;
}
