import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../shared/pipes';
import { CreateSnapshotDto, PaginatedSnapshotResponseDto, QuerySnapshotDto, SnapshotResponseDto } from './dto';
import { SnapshotService } from './snapshot.service';

@ApiTags('Snapshots')
@Controller('snapshots')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new snapshot',
    description:
      'Creates a new snapshot for an algorithm preset execution. Status defaults to "queued". Note: Status updates happen externally (not via API).',
  })
  @ApiBody({ type: CreateSnapshotDto })
  @ApiResponse({
    status: 201,
    description: 'Snapshot successfully created',
    type: SnapshotResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or AlgorithmPreset ID format',
  })
  create(@Body() createDto: CreateSnapshotDto) {
    return this.snapshotService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all snapshots',
    description:
      'Retrieves a paginated list of snapshots with optional filtering by status and algorithmPreset, sorting, and population.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved snapshots',
    type: PaginatedSnapshotResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid AlgorithmPreset ID format in filter',
  })
  findAll(@Query() queryDto: QuerySnapshotDto) {
    return this.snapshotService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a snapshot by ID',
    description: 'Retrieves a single snapshot by its unique identifier with the associated AlgorithmPreset populated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Snapshot unique identifier',
    example: '6710be...',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved snapshot',
    type: SnapshotResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Snapshot not found',
  })
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.snapshotService.findById(id);
  }
}
