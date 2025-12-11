import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_STATUS } from '@reputo/database';

class SnapshotEventDataDto {
  @ApiProperty({
    description: 'Snapshot unique identifier',
    example: '6710be...',
  })
  _id: string;

  @ApiProperty({
    description: 'Current execution status',
    enum: SNAPSHOT_STATUS,
    example: 'running',
  })
  status: (typeof SNAPSHOT_STATUS)[number];

  @ApiPropertyOptional({
    description: 'Reference to the associated AlgorithmPreset',
    example: '66f9c9...',
  })
  algorithmPreset?: string;

  @ApiPropertyOptional({
    description: 'Algorithm execution outputs',
    type: 'object',
    additionalProperties: true,
  })
  outputs?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Timestamp when execution started',
    example: '2025-10-13T19:12:03.010Z',
  })
  startedAt?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when execution completed',
    example: '2025-10-13T19:12:44.600Z',
  })
  completedAt?: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-13T19:12:44.600Z',
  })
  updatedAt: string;
}

export class SnapshotEventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'snapshot:updated',
  })
  type: 'snapshot:updated';

  @ApiProperty({
    description: 'Event payload with snapshot data',
    type: SnapshotEventDataDto,
  })
  data: SnapshotEventDataDto;
}
