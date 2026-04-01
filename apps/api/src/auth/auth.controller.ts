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
import type { Request, Response } from 'express';
import { DeepIdAuthService } from './deep-id-auth.service';
import { DeepIdCurrentSessionDto } from './dto';
import type { DeepIdCallbackQuery } from './types';

@ApiTags('Deep ID Auth')
@Controller('auth/deep-id')
export class DeepIdAuthController {
  constructor(private readonly deepIdAuthService: DeepIdAuthService) {}

  @Get('login')
  @ApiOperation({
    summary: 'Start the Deep ID OAuth flow',
    description: 'Creates the transient PKCE/OIDC flow state and redirects the browser to Deep ID.',
  })
  @ApiFoundResponse({ description: 'Redirects the browser to Deep ID.' })
  async login(@Res() response: Response): Promise<void> {
    const redirectUrl = await this.deepIdAuthService.getLoginRedirectUrl(response);
    response.redirect(redirectUrl);
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Handle the Deep ID OAuth callback',
    description:
      'Exchanges the authorization code, validates the ID token, syncs userinfo, creates the opaque app session, and redirects back to the app.',
  })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'error', required: false, type: String })
  @ApiQuery({ name: 'error_description', required: false, type: String })
  @ApiFoundResponse({ description: 'Redirects the browser back to the public app URL.' })
  @ApiUnauthorizedResponse({ description: 'State, nonce, authorization code, or token validation failed.' })
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
  me(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.deepIdAuthService.getCurrentSession(request, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout the current Deep ID-backed application session',
    description: 'Revokes the current opaque application session and clears the auth cookies.',
  })
  @ApiNoContentResponse({ description: 'Auth session invalidated and cookie cleared.' })
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.deepIdAuthService.logout(request, response);
  }
}
