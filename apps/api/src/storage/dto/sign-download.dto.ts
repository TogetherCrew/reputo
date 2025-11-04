import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignDownloadDto {
  @ApiProperty({
    description: 'S3 object key to generate download URL for',
    example: 'uploads/1699123456/votes.csv',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
