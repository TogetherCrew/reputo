import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../shared/pipes';
import { AlgorithmPresetService } from './algorithm-preset.service';
import {
  AlgorithmPresetResponseDto,
  CreateAlgorithmPresetDto,
  PaginatedAlgorithmPresetResponseDto,
  QueryAlgorithmPresetDto,
  UpdateAlgorithmPresetDto,
} from './dto';

@ApiTags('Algorithm Presets')
@Controller('algorithm-presets')
export class AlgorithmPresetController {
  constructor(private readonly algorithmPresetService: AlgorithmPresetService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new algorithm preset',
    description: 'Creates a new algorithm preset with specified algorithm definition, inputs, and optional metadata.',
  })
  @ApiBody({ type: CreateAlgorithmPresetDto })
  @ApiResponse({
    status: 201,
    description: 'Algorithm preset successfully created',
    type: AlgorithmPresetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or validation error',
  })
  create(@Body() createDto: CreateAlgorithmPresetDto) {
    return this.algorithmPresetService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all algorithm presets',
    description: 'Retrieves a paginated list of all algorithm presets with optional sorting and population.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved algorithm presets',
    type: PaginatedAlgorithmPresetResponseDto,
  })
  findAll(@Query() queryDto: QueryAlgorithmPresetDto) {
    return this.algorithmPresetService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an algorithm preset by ID',
    description: 'Retrieves a single algorithm preset by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Algorithm preset unique identifier',
    example: '66f9c9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved algorithm preset',
    type: AlgorithmPresetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Algorithm preset not found',
  })
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.algorithmPresetService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an algorithm preset',
    description:
      'Updates an existing algorithm preset. Note: spec fields (key, version) are immutable and cannot be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Algorithm preset unique identifier',
    example: '66f9c9...',
  })
  @ApiBody({ type: UpdateAlgorithmPresetDto })
  @ApiResponse({
    status: 200,
    description: 'Algorithm preset successfully updated',
    type: AlgorithmPresetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Algorithm preset not found',
  })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateDto: UpdateAlgorithmPresetDto) {
    return this.algorithmPresetService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an algorithm preset',
    description: 'Permanently deletes an algorithm preset by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Algorithm preset unique identifier',
    example: '66f9c9...',
  })
  @ApiResponse({
    status: 204,
    description: 'Algorithm preset successfully deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Algorithm preset not found',
  })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.algorithmPresetService.remove(id);
  }
}
