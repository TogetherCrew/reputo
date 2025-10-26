import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty({
    description: 'Results found',
    isArray: true,
  })
  results: T[];

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Maximum number of results per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Total number of documents',
    example: 47,
  })
  totalResults: number;
}
