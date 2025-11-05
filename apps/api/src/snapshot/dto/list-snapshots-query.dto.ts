import { ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_STATUS, SnapshotStatus } from '@reputo/database';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
    description: 'Filter by algorithm key (from algorithmPresetFrozen)',
    example: 'voting_engagement',
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    description: 'Filter by algorithm version (from algorithmPresetFrozen)',
    example: '1.0.0',
  })
  @IsString()
  @IsOptional()
  version?: string;
}
