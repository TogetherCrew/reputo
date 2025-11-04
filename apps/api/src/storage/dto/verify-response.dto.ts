import { ApiProperty } from '@nestjs/swagger';

class VerifyMetadataDto {
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
    description: 'MIME type of the uploaded file',
    example: 'text/csv',
  })
  contentType: string;

  @ApiProperty({
    description: 'Unix timestamp when file was uploaded',
    example: 1699123456,
  })
  timestamp: number;
}

export class VerifyResponseDto {
  @ApiProperty({
    description: 'S3 object key that was verified',
    example: 'uploads/1699123456/votes.csv',
  })
  key: string;

  @ApiProperty({
    description: 'File metadata including filename, extension, size, and content type',
    type: VerifyMetadataDto,
  })
  metadata: VerifyMetadataDto;
}
