import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConsentInitiateQueryDto {
  @ApiProperty({
    description: 'Configured source slug initiating the OAuth consent flow',
    example: 'voting-portal',
  })
  @IsString()
  @IsNotEmpty()
  source!: string;
}
