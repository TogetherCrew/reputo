import { ApiProperty } from '@nestjs/swagger';

export class DownloadResponseDto {
  @ApiProperty({
    description: 'Presigned GET URL for downloading the file',
    example: 'https://bucket.s3.region.amazonaws.com/key?X-Amz-Algorithm=...&X-Amz-Signature=...',
  })
  url: string;

  @ApiProperty({
    description: 'URL expiration time in seconds',
    example: 300,
  })
  expiresIn: number;
}
