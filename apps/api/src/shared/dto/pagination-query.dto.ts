import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Base DTO for pagination queries with sorting and population support.
 * Extend this class for entity-specific query DTOs.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas',
    example: 'createdAt:desc',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Populate data fields (comma-separated)',
    example: 'algorithmPreset',
  })
  @IsString()
  @IsOptional()
  populate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results per page',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;
}
