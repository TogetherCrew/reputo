import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeepIdConsentCallbackQueryDto {
  @ApiPropertyOptional({
    description: 'Deep ID authorization code',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Opaque Deep ID consent flow state',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Deep ID authorization error',
    example: 'access_denied',
  })
  @IsString()
  @IsOptional()
  error?: string;

  @ApiPropertyOptional({
    description: 'Deep ID authorization error description',
  })
  @IsString()
  @IsOptional()
  error_description?: string;

  @ApiPropertyOptional({
    description: 'Deep ID echoed granted scopes. Accepted and discarded.',
  })
  @IsString()
  @IsOptional()
  scope?: string;
}
