import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUploadDto {
  @ApiProperty({
    description: 'S3 object key to verify',
    example: 'uploads/1699123456/votes.csv',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
