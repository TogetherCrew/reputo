import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACCESS_ROLES, type AccessRole } from '@reputo/database';

export class AdminViewDto {
  @ApiProperty({
    description: 'Allowlisted email address.',
    example: 'owner@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Access role granted to the email address.',
    enum: ACCESS_ROLES,
  })
  role: AccessRole;

  @ApiProperty({
    description: 'Invitation timestamp.',
    example: '2026-05-12T10:00:00.000Z',
  })
  invitedAt: string;

  @ApiPropertyOptional({
    description: 'Email address of the user that invited this row.',
    example: 'owner@example.com',
  })
  invitedByEmail?: string;
}
