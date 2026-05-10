import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConsentCallbackQueryDto {
  @ApiPropertyOptional({
    description: 'OAuth authorization code',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Opaque OAuth consent flow state',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'OAuth authorization error',
    example: 'access_denied',
  })
  @IsString()
  @IsOptional()
  error?: string;

  @ApiPropertyOptional({
    description: 'OAuth authorization error description',
  })
  @IsString()
  @IsOptional()
  error_description?: string;

  @ApiPropertyOptional({
    description: 'Provider-echoed granted scopes. Accepted and discarded.',
  })
  @IsString()
  @IsOptional()
  scope?: string;
}
