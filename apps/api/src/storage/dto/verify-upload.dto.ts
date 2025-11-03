import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUploadDto {
  @ApiProperty({
    description: 'S3 object key to verify',
    example: 'uploads/2025/11/02/uuid-file.csv',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
