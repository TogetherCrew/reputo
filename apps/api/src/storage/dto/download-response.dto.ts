import { ApiProperty } from '@nestjs/swagger';

class DownloadMetadataDto {
  @ApiProperty({
    description: 'Original filename',
    example: 'votes.csv',
  })
  filename: string;

  @ApiProperty({
    description: 'File extension',
    example: 'csv',
  })
  ext: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 524288,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'text/csv',
  })
  contentType: string;

  @ApiProperty({
    description: 'Unix timestamp when file was uploaded',
    example: 1699123456,
  })
  timestamp: number;
}

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

  @ApiProperty({
    description: 'File metadata including filename, extension, size, and content type',
    type: DownloadMetadataDto,
  })
  metadata: DownloadMetadataDto;
}
