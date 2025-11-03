import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadDto {
  @ApiProperty({
    description: 'content type of the file to upload',
    example: 'text/csv',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
