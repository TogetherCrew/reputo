import { ApiProperty } from '@nestjs/swagger';

class AlgorithmPresetInputDto {
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

export class AlgorithmPresetDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '66f9c9...',
  })
  _id: string;

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

  @ApiProperty({
    description: 'Array of input parameters',
    type: [AlgorithmPresetInputDto],
  })
  inputs: AlgorithmPresetInputDto[];

  @ApiProperty({
    description: 'Human-readable name (3-100 characters)',
    example: 'Voting engagement v1',
    required: false,
    minLength: 3,
    maxLength: 100,
  })
  name?: string;

  @ApiProperty({
    description: 'Description of the preset (10-500 characters)',
    example: 'TogetherCrew test',
    required: false,
    minLength: 10,
    maxLength: 500,
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
