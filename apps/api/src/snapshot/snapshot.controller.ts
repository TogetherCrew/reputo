import type { MessageEvent } from '@nestjs/common';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Sse } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { map, type Observable } from 'rxjs';
import { PaginationDto } from '../shared/dto';
import { ParseObjectIdPipe } from '../shared/pipes';
import { CreateSnapshotDto, ListSnapshotsQueryDto, SnapshotDto, SnapshotEventDto } from './dto';
import { SnapshotService } from './snapshot.service';
import { SnapshotEventsService } from './snapshot-events.service';

@ApiExtraModels(PaginationDto, SnapshotDto, SnapshotEventDto)
@ApiTags('Snapshots')
@Controller('snapshots')
export class SnapshotController {
  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly eventsService: SnapshotEventsService,
  ) {}

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

  @Sse('events')
  @ApiOperation({
    summary: 'Subscribe to snapshot status changes via SSE',
    description:
      'Opens a Server-Sent Events stream to receive real-time notifications when snapshot statuses change. Optionally filter by algorithmPreset ID.',
  })
  @ApiQuery({
    name: 'algorithmPreset',
    required: false,
    description: 'Filter events by AlgorithmPreset ID',
    example: '66f9c9...',
  })
  @ApiOkResponse({
    description: 'SSE stream established',
    type: SnapshotEventDto,
  })
  subscribeToEvents(@Query('algorithmPreset') algorithmPreset?: string): Observable<MessageEvent> {
    return this.eventsService.subscribe({ algorithmPreset }).pipe(
      map((event) => ({
        data: event,
      })),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all snapshots',
    description:
      'Retrieves a paginated list of snapshots with optional filtering by status, algorithmPreset ID, algorithm key, and version, sorting, and population.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved snapshots',
    type: PaginationDto<SnapshotDto>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid AlgorithmPreset ID format in filter or invalid query parameters',
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a snapshot',
    description:
      'Permanently deletes a snapshot by its unique identifier. ' +
      'If the snapshot status is "running", cancels the Temporal workflow before deletion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Snapshot unique identifier',
    example: '6710be...',
  })
  @ApiNoContentResponse({
    description: 'Snapshot successfully deleted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID format',
  })
  @ApiNotFoundResponse({
    description: 'Snapshot not found',
  })
  deleteById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.snapshotService.deleteById(id);
  }
}
