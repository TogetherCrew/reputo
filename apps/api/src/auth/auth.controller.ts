import { Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { DeepIdUserWithId } from '@reputo/database';
import type { Request, Response } from 'express';
import { CurrentSession, CurrentUser, Public } from '../shared/decorators';
import type { CurrentAuthSession, DeepIdCallbackQuery } from '../shared/types';
import { DeepIdAuthService } from './deep-id-auth.service';
import { DeepIdCurrentSessionDto } from './dto';

@ApiTags('Deep ID Auth')
@Controller('auth/deep-id')
export class DeepIdAuthController {
  constructor(private readonly deepIdAuthService: DeepIdAuthService) {}

  @Get('login')
  @Public()
  @ApiOperation({
    summary: 'Start the Deep ID OAuth flow',
    description: 'Creates the transient PKCE auth flow state and redirects the browser to Deep ID.',
  })
  @ApiFoundResponse({ description: 'Redirects the browser to Deep ID.' })
  async login(@Res() response: Response): Promise<void> {
    const redirectUrl = await this.deepIdAuthService.getLoginRedirectUrl(response);
    response.redirect(redirectUrl);
  }

  @Get('callback')
  @Public()
  @ApiOperation({
    summary: 'Handle the Deep ID OAuth callback',
    description:
      'Exchanges the authorization code, syncs userinfo, creates the opaque app session, and redirects back to the app.',
  })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'error', required: false, type: String })
  @ApiQuery({ name: 'error_description', required: false, type: String })
  @ApiFoundResponse({ description: 'Redirects the browser back to the public app URL.' })
  @ApiUnauthorizedResponse({ description: 'State validation, authorization code exchange, or userinfo sync failed.' })
  async callback(
    @Query() query: DeepIdCallbackQuery,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const redirectUrl = await this.deepIdAuthService.handleCallback(query, request, response);
    response.redirect(redirectUrl);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Bootstrap the current Deep ID-backed application session',
    description:
      'Reads the opaque auth cookie, refreshes provider tokens when needed, and returns the current session state.',
  })
  @ApiOkResponse({
    description: 'Returns the current auth session bootstrap payload.',
    type: DeepIdCurrentSessionDto,
  })
  @ApiUnauthorizedResponse({ description: 'Deep ID-backed session required.' })
  me(@CurrentSession() session: CurrentAuthSession, @CurrentUser() user: DeepIdUserWithId) {
    return this.deepIdAuthService.toCurrentSessionView(session, user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout the current Deep ID-backed application session',
    description: 'Revokes the current opaque application session and clears the auth cookies.',
  })
  @ApiNoContentResponse({ description: 'Auth session invalidated and cookie cleared.' })
  @ApiUnauthorizedResponse({ description: 'Deep ID-backed session required.' })
  logout(@CurrentSession() session: CurrentAuthSession, @Res({ passthrough: true }) response: Response) {
    return this.deepIdAuthService.logout(session, response);
  }
}
