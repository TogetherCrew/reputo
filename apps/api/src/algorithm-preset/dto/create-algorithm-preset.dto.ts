import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class SpecDto {
  @ApiProperty({
    description: 'Unique algorithm identifier',
    example: 'voting_engagement',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Algorithm version',
    example: '1.0.0',
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}

class InputDto {
  @ApiProperty({
    description: 'Parameter key/name',
    example: 'votes',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Parameter value (can be any type)',
    example: 's3://tc/votes.csv',
    required: false,
  })
  @IsOptional()
  value?: unknown;
}

export class CreateAlgorithmPresetDto {
  @ApiProperty({
    description: 'Algorithm specification containing key and version',
    type: SpecDto,
  })
  @ValidateNested()
  @Type(() => SpecDto)
  @IsNotEmpty()
  spec: SpecDto;

  @ApiProperty({
    description: 'Array of input parameters for the algorithm',
    type: [InputDto],
    example: [{ key: 'votes', value: 's3://tc/votes.csv' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputDto)
  inputs: InputDto[];

  @ApiProperty({
    description: 'Optional human-readable name for the preset',
    example: 'Voting engagement v1',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Optional description of the preset',
    example: 'TogetherCrew test',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
