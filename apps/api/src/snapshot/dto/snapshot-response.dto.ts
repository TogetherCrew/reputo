import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SNAPSHOT_STATUS = ['queued', 'running', 'completed', 'failed', 'cancelled'] as const;

class TemporalResponseDto {
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

export class SnapshotResponseDto {
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
    type: TemporalResponseDto,
  })
  temporal?: TemporalResponseDto;

  @ApiProperty({
    description: 'Reference to the associated AlgorithmPreset',
    example: '66f9c9...',
  })
  algorithmPreset: string | unknown;

  @ApiPropertyOptional({
    description: 'Algorithm execution outputs/results',
    example: {},
  })
  outputs?: unknown;

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

export class PaginatedSnapshotResponseDto {
  @ApiProperty({
    description: 'Results found',
    type: [SnapshotResponseDto],
  })
  results: SnapshotResponseDto[];

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
