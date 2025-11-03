import { ApiProperty } from '@nestjs/swagger';

export class VerifyResponseDto {
  @ApiProperty({
    description: 'S3 object key that was verified',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  key: string;

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
}
