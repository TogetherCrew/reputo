import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { DeepIdConsentSourceConfig } from '../config/deep-id-consent.config';
import { DeepIdOAuthClient } from '../shared/deep-id';
import { createPkceChallenge, createRandomToken } from '../shared/utils';
import { DeepIdGrantRepository } from './deep-id-grant.repository';
import type { DeepIdConsentCallbackQueryDto } from './dto';

type DeepIdConsentRedirectReason = 'denied_consent' | 'provider_error';

export class InvalidDeepIdConsentStateException extends Error {
  constructor() {
    super('Deep ID consent state is invalid, expired, or already used.');
    this.name = InvalidDeepIdConsentStateException.name;
  }
}

function getStateSuffix(state: string | undefined): string | undefined {
  return state ? state.slice(-8) : undefined;
}

function buildReturnUrl(
  returnUrl: string,
  connected: 'success' | 'error',
  reason?: DeepIdConsentRedirectReason,
): string {
  const url = new URL(returnUrl);

  url.searchParams.set('reputo_connected', connected);

  if (reason) {
    url.searchParams.set('reason', reason);
  } else {
    url.searchParams.delete('reason');
  }

  return url.toString();
}

@Injectable()
export class DeepIdConsentService {
  private readonly grantTtlSeconds: number;
  private readonly redirectUri: string;
  private readonly sources: Record<string, DeepIdConsentSourceConfig>;

  constructor(
    @InjectPinoLogger(DeepIdConsentService.name)
    private readonly logger: PinoLogger,
    private readonly grantRepository: DeepIdGrantRepository,
    private readonly deepIdOAuthClient: DeepIdOAuthClient,
    configService: ConfigService,
  ) {
    this.grantTtlSeconds = configService.get<number>('deepIdConsent.grantTtlSeconds') as number;
    this.redirectUri = configService.get<string>('deepIdConsent.redirectUri') as string;
    this.sources = configService.get<Record<string, DeepIdConsentSourceConfig>>('deepIdConsent.sources') ?? {};
  }

  async initiate(source: string): Promise<string> {
    const sourceConfig = this.sources[source];

    if (!sourceConfig) {
      throw new BadRequestException(`Unknown Deep ID consent source: ${source}`);
    }

    const state = createRandomToken(32);
    const codeVerifier = createRandomToken(32);
    const codeChallenge = createPkceChallenge(codeVerifier);
    const expiresAt = new Date(Date.now() + this.grantTtlSeconds * 1000);

    await this.grantRepository.create({
      source,
      state,
      codeVerifier,
      expiresAt,
    });

    return this.deepIdOAuthClient.buildAuthorizationUrl({
      redirectUri: this.redirectUri,
      scope: sourceConfig.scope,
      state,
      codeChallenge,
    });
  }

  async handleCallback(query: DeepIdConsentCallbackQueryDto): Promise<string> {
    if (!query.state) {
      this.logInvalidState(query.state);
      throw new InvalidDeepIdConsentStateException();
    }

    const grant = await this.grantRepository.findActiveByState(query.state);

    if (!grant) {
      await this.grantRepository.deleteByState(query.state);
      this.logInvalidState(query.state);
      throw new InvalidDeepIdConsentStateException();
    }

    const sourceConfig = this.sources[grant.source];

    try {
      if (!sourceConfig) {
        throw new InvalidDeepIdConsentStateException();
      }

      if (query.error) {
        const reason: DeepIdConsentRedirectReason =
          query.error === 'access_denied' ? 'denied_consent' : 'provider_error';
        this.logCallback(grant.source, grant.state, 'error', reason);
        return buildReturnUrl(sourceConfig.returnUrl, 'error', reason);
      }

      if (!query.code) {
        this.logCallback(grant.source, grant.state, 'error', 'provider_error');
        return buildReturnUrl(sourceConfig.returnUrl, 'error', 'provider_error');
      }

      try {
        await this.deepIdOAuthClient.exchangeCodeForTokens({
          code: query.code,
          codeVerifier: grant.codeVerifier,
          redirectUri: this.redirectUri,
        });
      } catch {
        this.logCallback(grant.source, grant.state, 'error', 'provider_error');
        return buildReturnUrl(sourceConfig.returnUrl, 'error', 'provider_error');
      }

      this.logCallback(grant.source, grant.state, 'success');
      return buildReturnUrl(sourceConfig.returnUrl, 'success');
    } finally {
      await this.grantRepository.deleteByState(grant.state);
    }
  }

  private logInvalidState(state: string | undefined): void {
    this.logger.warn(
      {
        stateSuffix: getStateSuffix(state),
        outcome: 'error',
        reason: 'invalid_state',
      },
      'Deep ID consent callback rejected',
    );
  }

  private logCallback(
    source: string,
    state: string,
    outcome: 'success' | 'error',
    reason?: DeepIdConsentRedirectReason,
  ): void {
    const payload = {
      source,
      stateSuffix: getStateSuffix(state),
      outcome,
      ...(reason ? { reason } : {}),
    };

    if (outcome === 'success') {
      this.logger.info(payload, 'Deep ID consent callback completed');
    } else {
      this.logger.warn(payload, 'Deep ID consent callback completed');
    }
  }
}
