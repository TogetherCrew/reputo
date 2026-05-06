import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DEEP_ID_CONSENT_INVALID_STATE_HTML } from '../shared/constants';
import { Public } from '../shared/decorators';
import { DeepIdConsentService, InvalidDeepIdConsentStateException } from './deep-id-consent.service';
import { DeepIdConsentCallbackQueryDto, DeepIdConsentInitiateQueryDto } from './dto';

@ApiTags('Deep ID Consent')
@Controller('deep-id/consent')
export class DeepIdConsentController {
  constructor(private readonly deepIdConsentService: DeepIdConsentService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Start a Deep ID consent flow',
    description: 'Creates transient PKCE state for the configured source and redirects the browser to Deep ID.',
  })
  @ApiQuery({ name: 'source', required: true, type: String, example: 'voting-portal' })
  @ApiFoundResponse({ description: 'Redirects the browser to Deep ID.' })
  @ApiBadRequestResponse({ description: 'Missing or unknown source.' })
  async initiate(@Query() query: DeepIdConsentInitiateQueryDto, @Res() response: Response): Promise<void> {
    const redirectUrl = await this.deepIdConsentService.initiate(query.source);
    response.redirect(redirectUrl);
  }

  @Get('callback')
  @Public()
  @ApiOperation({
    summary: 'Handle the Deep ID consent callback',
    description:
      'Consumes transient consent state, exchanges the authorization code, discards tokens, and redirects back to the source.',
  })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'error', required: false, type: String })
  @ApiQuery({ name: 'error_description', required: false, type: String })
  @ApiQuery({ name: 'scope', required: false, type: String })
  @ApiFoundResponse({ description: 'Redirects the browser back to the configured source return URL.' })
  @ApiBadRequestResponse({ description: 'Invalid, expired, or replayed consent state.' })
  @ApiUnauthorizedResponse({ description: 'Not used by this public endpoint.' })
  async callback(@Query() query: DeepIdConsentCallbackQueryDto, @Res() response: Response): Promise<void> {
    try {
      const redirectUrl = await this.deepIdConsentService.handleCallback(query);
      response.redirect(redirectUrl);
    } catch (error) {
      if (error instanceof InvalidDeepIdConsentStateException) {
        response.status(HttpStatus.BAD_REQUEST).type('html').send(DEEP_ID_CONSENT_INVALID_STATE_HTML);
        return;
      }

      throw error;
    }
  }
}
