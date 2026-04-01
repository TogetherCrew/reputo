import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeepIdCurrentSessionUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  did!: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  givenName?: string;

  @ApiPropertyOptional()
  familyName?: string;

  @ApiPropertyOptional()
  picture?: string;

  @ApiProperty({ type: [String] })
  walletAddresses!: string[];

  @ApiProperty()
  kycVerified!: boolean;

  @ApiProperty({ type: [String] })
  amr!: string[];
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
