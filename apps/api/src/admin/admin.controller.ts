import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ACCESS_ROLE_ADMIN, ACCESS_ROLE_OWNER, type OAuthUserWithId } from '@reputo/database';
import type { Response } from 'express';
import { CurrentUser, Roles } from '../shared/decorators';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AdminService } from './admin.service';
import { AdminViewDto, CreateAdminDto } from './dto';

@ApiTags('Admins')
@ApiUnauthorizedResponse({ description: 'Authenticated session required.' })
@UseGuards(RolesGuard)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Roles(ACCESS_ROLE_OWNER, ACCESS_ROLE_ADMIN)
  @ApiOperation({
    summary: 'List active admin access rows',
    description: 'Returns the active owner and admin allowlist rows without internal document identifiers.',
  })
  @ApiOkResponse({
    description: 'Active allowlist rows with owner first and admins sorted by email.',
    type: [AdminViewDto],
  })
  @ApiForbiddenResponse({ description: 'Admin or owner role required.' })
  listAdmins(): Promise<AdminViewDto[]> {
    return this.adminService.listAllAccess();
  }

  @Post()
  @Roles(ACCESS_ROLE_OWNER)
  @ApiOperation({
    summary: 'Add an admin',
    description: 'Creates a new active admin allowlist row or restores a previously revoked admin row.',
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({
    description: 'Admin allowlist row created.',
    type: AdminViewDto,
  })
  @ApiOkResponse({
    description: 'Previously revoked admin allowlist row restored.',
    type: AdminViewDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  @ApiForbiddenResponse({ description: 'Owner role required.' })
  @ApiConflictResponse({ description: 'An active allowlist row already exists for this email.' })
  async addAdmin(
    @CurrentUser() actor: OAuthUserWithId,
    @Body() body: CreateAdminDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminViewDto> {
    const result = await this.adminService.addAdmin(actor, body.email);
    response.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);

    return result.admin;
  }

  @Delete(':email')
  @Roles(ACCESS_ROLE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove an admin',
    description: 'Soft-revokes the active allowlist row and revokes all active sessions for that admin.',
  })
  @ApiParam({
    name: 'email',
    description: 'Email address to remove from the active admin allowlist.',
    example: 'admin@example.com',
  })
  @ApiNoContentResponse({ description: 'Admin allowlist row revoked and active sessions invalidated.' })
  @ApiBadRequestResponse({ description: 'Invalid email parameter.' })
  @ApiForbiddenResponse({ description: 'Owner role required, or owner attempted to remove themselves.' })
  @ApiNotFoundResponse({ description: 'No active allowlist row exists for this email.' })
  removeAdmin(@CurrentUser() actor: OAuthUserWithId, @Param('email') email: string): Promise<void> {
    return this.adminService.removeAdmin(actor, email);
  }
}
