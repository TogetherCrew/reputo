import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeepIdConsentInitiateQueryDto {
  @ApiProperty({
    description: 'Configured source slug initiating the Deep ID consent flow',
    example: 'voting-portal',
  })
  @IsString()
  @IsNotEmpty()
  source!: string;
}
