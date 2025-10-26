import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../shared/dto';
import { ParseObjectIdPipe } from '../shared/pipes';
import { CreateSnapshotDto, ListSnapshotsQueryDto, SnapshotDto } from './dto';
import { SnapshotService } from './snapshot.service';

@ApiExtraModels(PaginationDto, SnapshotDto)
@ApiTags('Snapshots')
@Controller('snapshots')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new snapshot',
    description: 'Creates a new snapshot for an algorithm preset. Status defaults to "queued".',
  })
  @ApiBody({ type: CreateSnapshotDto })
  @ApiCreatedResponse({
    description: 'Snapshot successfully created',
    type: SnapshotDto,
  })
  @ApiBadRequestResponse({
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
  @ApiOkResponse({
    description: 'Successfully retrieved snapshots',
    type: PaginationDto<SnapshotDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid AlgorithmPreset ID format in filter',
  })
  list(@Query() queryDto: ListSnapshotsQueryDto) {
    return this.snapshotService.list(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a snapshot by ID',
    description: 'Retrieves a single snapshot by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Snapshot unique identifier',
    example: '6710be...',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved snapshot',
    type: SnapshotDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID format',
  })
  @ApiNotFoundResponse({
    description: 'Snapshot not found',
  })
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.snapshotService.getById(id);
  }
}
