import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
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
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../shared/dto';
import { ParseObjectIdPipe } from '../shared/pipes';
import { AlgorithmPresetService } from './algorithm-preset.service';
import {
  AlgorithmPresetDto,
  CreateAlgorithmPresetDto,
  ListAlgorithmPresetsQueryDto,
  UpdateAlgorithmPresetDto,
} from './dto';

@ApiExtraModels(PaginationDto, AlgorithmPresetDto)
@ApiTags('Algorithm Presets')
@Controller('algorithm-presets')
export class AlgorithmPresetController {
  constructor(private readonly algorithmPresetService: AlgorithmPresetService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new algorithm preset',
    description: 'Creates a new algorithm preset with key, version, inputs, and optional metadata.',
  })
  @ApiBody({ type: CreateAlgorithmPresetDto })
  @ApiCreatedResponse({
    description: 'Algorithm preset successfully created',
    type: AlgorithmPresetDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body (missing required fields, invalid data types, name must be 3-100 chars, description must be 10-500 chars, or validation error)',
  })
  create(@Body() createDto: CreateAlgorithmPresetDto) {
    return this.algorithmPresetService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all algorithm presets',
    description: 'Retrieves a paginated list of all algorithm presets with optional sorting.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved algorithm presets',
    type: PaginationDto<AlgorithmPresetDto>,
  })
  list(@Query() queryDto: ListAlgorithmPresetsQueryDto) {
    return this.algorithmPresetService.list(queryDto);
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
  @ApiOkResponse({
    description: 'Successfully retrieved algorithm preset',
    type: AlgorithmPresetDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID format',
  })
  @ApiNotFoundResponse({
    description: 'Algorithm preset not found',
  })
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.algorithmPresetService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an algorithm preset',
    description:
      'Updates an existing algorithm preset. Note: key and version fields are immutable and cannot be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Algorithm preset unique identifier',
    example: '66f9c9...',
  })
  @ApiBody({ type: UpdateAlgorithmPresetDto })
  @ApiOkResponse({
    description: 'Algorithm preset successfully updated',
    type: AlgorithmPresetDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body, ID format, name must be 3-100 chars, description must be 10-500 chars, or validation error',
  })
  @ApiNotFoundResponse({
    description: 'Algorithm preset not found',
  })
  updateById(@Param('id', ParseObjectIdPipe) id: string, @Body() updateDto: UpdateAlgorithmPresetDto) {
    return this.algorithmPresetService.updateById(id, updateDto);
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
  @ApiNoContentResponse({
    description: 'Algorithm preset successfully deleted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID format',
  })
  @ApiNotFoundResponse({
    description: 'Algorithm preset not found',
  })
  deleteById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.algorithmPresetService.deleteById(id);
  }
}
