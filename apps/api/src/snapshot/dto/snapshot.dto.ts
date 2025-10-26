import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_STATUS } from '@reputo/database';

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
  algorithmPreset: string | unknown;

  @ApiPropertyOptional({
    description: 'Algorithm execution outputs',
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
