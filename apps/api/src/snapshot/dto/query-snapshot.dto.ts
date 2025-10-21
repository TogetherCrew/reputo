import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto';

const SNAPSHOT_STATUS = ['queued', 'running', 'completed', 'failed', 'cancelled'] as const;
type SnapshotStatus = (typeof SNAPSHOT_STATUS)[number];

/**
 * Query DTO for listing snapshots with pagination and filtering.
 * Extends base pagination DTO with snapshot-specific filters.
 */
export class QuerySnapshotDto extends PaginationQueryDto {
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
