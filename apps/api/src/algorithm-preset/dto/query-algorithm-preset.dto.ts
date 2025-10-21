import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto';

/**
 * Query DTO for listing algorithm presets with pagination and filtering.
 * Extends base pagination DTO with algorithm preset-specific filters.
 */
export class QueryAlgorithmPresetDto extends PaginationQueryDto {
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
