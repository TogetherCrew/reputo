import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Email address to add to the active admin allowlist.',
    example: 'admin@example.com',
  })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsString()
  @IsEmail()
  email: string;
}
