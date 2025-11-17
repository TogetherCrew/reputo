import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_STATUS } from '@reputo/database';

class AlgorithmPresetFrozenDto {
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
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: {},
      },
    },
  })
  inputs: Array<{ key: string; value?: unknown }>;

  @ApiPropertyOptional({
    description: 'Human-readable name',
    example: 'Voting engagement v1',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the preset',
    example: 'TogetherCrew test',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Creation timestamp',
    example: '2025-10-13T18:22:47.100Z',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2025-10-13T18:22:47.100Z',
  })
  updatedAt?: Date;
}

class SnapshotTemporalDto {
  @ApiPropertyOptional({
    description: 'Temporal workflow ID',
    example: 'wf-voting-engagement-abc123',
  })
  workflowId?: string;

  @ApiPropertyOptional({
    description: 'Temporal workflow run ID',
    example: 'a1b2c3',
  })
  runId?: string;

  @ApiPropertyOptional({
    description: 'Temporal task queue name',
    example: 'algorithms',
  })
  taskQueue?: string;
}

class SnapshotOutputsDto {
  @ApiPropertyOptional({
    description: 'S3 key or identifier for CSV output',
    example: 's3://bucket/path/result.csv',
  })
  csv?: string;
}

export class SnapshotDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '6710be...',
  })
  _id: string;

  @ApiProperty({
    description: 'Current execution status',
    enum: SNAPSHOT_STATUS,
    example: 'completed',
  })
  status: (typeof SNAPSHOT_STATUS)[number];

  @ApiPropertyOptional({
    description: 'Temporal workflow information',
    type: SnapshotTemporalDto,
  })
  temporal?: SnapshotTemporalDto;

  @ApiProperty({
    description: 'Reference to the associated AlgorithmPreset',
    example: '66f9c9...',
  })
  algorithmPreset: string;

  @ApiProperty({
    description: 'Frozen copy of the associated AlgorithmPreset at snapshot creation time',
    type: AlgorithmPresetFrozenDto,
  })
  algorithmPresetFrozen: AlgorithmPresetFrozenDto;

  @ApiPropertyOptional({
    description: 'Algorithm execution outputs with CSV key',
    type: SnapshotOutputsDto,
  })
  outputs?: SnapshotOutputsDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-13T19:12:03.010Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-13T19:12:44.600Z',
  })
  updatedAt: Date;
}
