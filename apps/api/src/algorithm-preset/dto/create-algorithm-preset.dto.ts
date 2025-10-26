import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

class AlgorithmPresetInputDto {
  @ApiProperty({
    description: 'Input key',
    example: 'votes',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Input value',
    example: 's3://tc/votes.csv',
  })
  @IsNotEmpty()
  value: unknown;
}

export class CreateAlgorithmPresetDto {
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

  @ApiProperty({
    description: 'Array of input parameters for the algorithm preset',
    type: [AlgorithmPresetInputDto],
    example: [{ key: 'votes', value: 's3://tc/votes.csv' }],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AlgorithmPresetInputDto)
  inputs: AlgorithmPresetInputDto[];

  @ApiProperty({
    description: 'Optional name for the algorithm preset (3-100 characters)',
    example: 'Voting engagement v1',
    required: false,
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Optional description of the algorithm preset (10-500 characters)',
    example: 'TogetherCrew test',
    required: false,
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string;
}
