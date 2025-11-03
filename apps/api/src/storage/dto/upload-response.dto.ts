import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Unique S3 object key for the upload',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  key: string;

  @ApiProperty({
    description: 'Presigned PUT URL for direct S3 upload',
    example: 'https://bucket.s3.region.amazonaws.com/key?X-Amz-Algorithm=...&X-Amz-Signature=...',
  })
  url: string;

  @ApiProperty({
    description: 'URL expiration time in seconds',
    example: 120,
  })
  expiresIn: number;
}
