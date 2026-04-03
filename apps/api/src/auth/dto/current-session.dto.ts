import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeepIdCurrentSessionUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  provider!: string;

  @ApiProperty()
  sub!: string;

  @ApiPropertyOptional({ type: [String] })
  aud?: string[];

  @ApiPropertyOptional()
  auth_time?: number;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  email_verified?: boolean;

  @ApiPropertyOptional()
  iat?: number;

  @ApiPropertyOptional()
  iss?: string;

  @ApiPropertyOptional()
  picture?: string;

  @ApiPropertyOptional()
  rat?: number;

  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional({ example: '2026-05-02T10:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional({ example: '2026-05-02T10:00:00.000Z' })
  updatedAt?: string;
}

export class DeepIdCurrentSessionDto {
  @ApiProperty()
  authenticated!: boolean;

  @ApiPropertyOptional({ example: 'deep-id' })
  provider?: string;

  @ApiPropertyOptional({ example: '2026-05-02T10:00:00.000Z' })
  expiresAt?: string;

  @ApiPropertyOptional({ type: [String] })
  scope?: string[];

  @ApiPropertyOptional({ type: DeepIdCurrentSessionUserDto })
  user?: DeepIdCurrentSessionUserDto;
}
