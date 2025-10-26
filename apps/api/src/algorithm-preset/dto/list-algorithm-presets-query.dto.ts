import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/dto';

export class ListAlgorithmPresetsQueryDto extends PaginationQueryDto {
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
