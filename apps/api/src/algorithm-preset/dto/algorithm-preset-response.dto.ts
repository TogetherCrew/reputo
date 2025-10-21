import { ApiProperty } from '@nestjs/swagger';

class SpecResponseDto {
  @ApiProperty({
    description: 'Unique algorithm identifier',
    example: 'voting_engagement',
  })
  key: string;

  @ApiProperty({
    description: 'Algorithm version',
    example: '1.0.0',
  })
  version: string;
}

class InputResponseDto {
  @ApiProperty({
    description: 'Parameter key/name',
    example: 'votes',
  })
  key: string;

  @ApiProperty({
    description: 'Parameter value (can be any type)',
    example: 's3://tc/votes.csv',
    required: false,
  })
  value?: unknown;
}

export class AlgorithmPresetResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '66f9c9...',
  })
  _id: string;

  @ApiProperty({
    description: 'Algorithm specification',
    type: SpecResponseDto,
  })
  spec: SpecResponseDto;

  @ApiProperty({
    description: 'Array of input parameters',
    type: [InputResponseDto],
  })
  inputs: InputResponseDto[];

  @ApiProperty({
    description: 'Human-readable name',
    example: 'Voting engagement v1',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Description of the preset',
    example: 'TogetherCrew test',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-13T18:22:47.100Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-13T18:22:47.100Z',
  })
  updatedAt: Date;
}

export class PaginatedAlgorithmPresetResponseDto {
  @ApiProperty({
    description: 'Results found',
    type: [AlgorithmPresetResponseDto],
  })
  results: AlgorithmPresetResponseDto[];

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
