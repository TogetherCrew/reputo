import { BadRequestException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { DeepIdGrantWithId } from '@reputo/database';
import { Types } from 'mongoose';
import type { PinoLogger } from 'nestjs-pino';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdConsentService, InvalidDeepIdConsentStateException } from '../../../src/deep-id-consent';
import type { DeepIdGrantRepository } from '../../../src/deep-id-consent/deep-id-grant.repository';
import type { DeepIdOAuthClient } from '../../../src/shared/deep-id';
import { createPkceChallenge } from '../../../src/shared/utils';

describe('DeepIdConsentService', () => {
  const now = new Date('2026-05-06T12:00:00.000Z');
  const sources = {
    'voting-portal': {
      returnUrl: 'http://localhost:3001/voting',
      scope: 'api wallets',
    },
  };

  let grantRepository: {
    create: ReturnType<typeof vi.fn>;
    findActiveByState: ReturnType<typeof vi.fn>;
    deleteByState: ReturnType<typeof vi.fn>;
  };
  let deepIdOAuthClient: {
    buildAuthorizationUrl: ReturnType<typeof vi.fn>;
    exchangeCodeForTokens: ReturnType<typeof vi.fn>;
  };
  let logger: {
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };
  let service: DeepIdConsentService;

  const grant: DeepIdGrantWithId = {
    _id: new Types.ObjectId(),
    source: 'voting-portal',
    state: 'state-12345678',
    codeVerifier: 'pkce-verifier',
    expiresAt: new Date('2026-05-06T12:10:00.000Z'),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    grantRepository = {
      create: vi.fn(async () => undefined),
      findActiveByState: vi.fn(),
      deleteByState: vi.fn(async () => true),
    };
    deepIdOAuthClient = {
      buildAuthorizationUrl: vi.fn(async () => 'https://identity.deep-id.ai/oauth2/auth?state=state'),
      exchangeCodeForTokens: vi.fn(async () => undefined),
    };
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
    };

    const configService = {
      get: vi.fn((key: string) => {
        const values: Record<string, unknown> = {
          'deepIdConsent.grantTtlSeconds': 600,
          'deepIdConsent.redirectUri': 'http://localhost:3000/api/v1/deep-id/consent/callback',
          'deepIdConsent.sources': sources,
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    service = new DeepIdConsentService(
      logger as unknown as PinoLogger,
      grantRepository as unknown as DeepIdGrantRepository,
      deepIdOAuthClient as unknown as DeepIdOAuthClient,
      configService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initiate', () => {
    it('persists a transient grant with TTL and returns the Deep ID authorization URL', async () => {
      const redirectUrl = await service.initiate('voting-portal');

      expect(redirectUrl).toBe('https://identity.deep-id.ai/oauth2/auth?state=state');
      expect(grantRepository.create).toHaveBeenCalledTimes(1);

      const createdGrant = grantRepository.create.mock.calls[0][0] as {
        source: string;
        state: string;
        codeVerifier: string;
        expiresAt: Date;
      };

      expect(createdGrant.source).toBe('voting-portal');
      expect(createdGrant.state).toMatch(/^[A-Za-z0-9_-]{43}$/u);
      expect(createdGrant.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/u);
      expect(createdGrant.expiresAt).toEqual(new Date('2026-05-06T12:10:00.000Z'));
      expect(deepIdOAuthClient.buildAuthorizationUrl).toHaveBeenCalledWith({
        redirectUri: 'http://localhost:3000/api/v1/deep-id/consent/callback',
        scope: 'api wallets',
        state: createdGrant.state,
        codeChallenge: createPkceChallenge(createdGrant.codeVerifier),
      });
    });

    it('rejects an unknown source without creating a grant', async () => {
      await expect(service.initiate('unknown-source')).rejects.toThrow(BadRequestException);

      expect(grantRepository.create).not.toHaveBeenCalled();
      expect(deepIdOAuthClient.buildAuthorizationUrl).not.toHaveBeenCalled();
    });
  });

  describe('handleCallback', () => {
    it('exchanges the code, deletes the grant, and returns a success URL', async () => {
      grantRepository.findActiveByState.mockResolvedValue(grant);

      const redirectUrl = await service.handleCallback({
        code: 'authorization-code',
        state: grant.state,
        scope: 'api wallets profile',
      });

      expect(redirectUrl).toBe('http://localhost:3001/voting?reputo_connected=success');
      expect(deepIdOAuthClient.exchangeCodeForTokens).toHaveBeenCalledWith({
        code: 'authorization-code',
        codeVerifier: 'pkce-verifier',
        redirectUri: 'http://localhost:3000/api/v1/deep-id/consent/callback',
      });
      expect(grantRepository.deleteByState).toHaveBeenCalledWith(grant.state);
    });

    it('maps Deep ID access_denied to denied_consent and deletes the grant', async () => {
      grantRepository.findActiveByState.mockResolvedValue(grant);

      const redirectUrl = await service.handleCallback({
        error: 'access_denied',
        error_description: 'User denied consent',
        state: grant.state,
      });

      expect(redirectUrl).toBe('http://localhost:3001/voting?reputo_connected=error&reason=denied_consent');
      expect(deepIdOAuthClient.exchangeCodeForTokens).not.toHaveBeenCalled();
      expect(grantRepository.deleteByState).toHaveBeenCalledWith(grant.state);
    });

    it('maps token exchange failures to provider_error and deletes the grant', async () => {
      grantRepository.findActiveByState.mockResolvedValue(grant);
      deepIdOAuthClient.exchangeCodeForTokens.mockRejectedValue(new Error('upstream failed'));

      const redirectUrl = await service.handleCallback({
        code: 'authorization-code',
        state: grant.state,
      });

      expect(redirectUrl).toBe('http://localhost:3001/voting?reputo_connected=error&reason=provider_error');
      expect(grantRepository.deleteByState).toHaveBeenCalledWith(grant.state);
    });

    it('maps a missing code to provider_error and deletes the grant', async () => {
      grantRepository.findActiveByState.mockResolvedValue(grant);

      const redirectUrl = await service.handleCallback({
        state: grant.state,
      });

      expect(redirectUrl).toBe('http://localhost:3001/voting?reputo_connected=error&reason=provider_error');
      expect(deepIdOAuthClient.exchangeCodeForTokens).not.toHaveBeenCalled();
      expect(grantRepository.deleteByState).toHaveBeenCalledWith(grant.state);
    });

    it('throws invalid state without redirecting when state is missing', async () => {
      await expect(service.handleCallback({ code: 'authorization-code' })).rejects.toThrow(
        InvalidDeepIdConsentStateException,
      );

      expect(grantRepository.findActiveByState).not.toHaveBeenCalled();
      expect(grantRepository.deleteByState).not.toHaveBeenCalled();
    });

    it('throws invalid state without redirecting when no active grant exists', async () => {
      grantRepository.findActiveByState.mockResolvedValue(null);

      await expect(service.handleCallback({ code: 'authorization-code', state: 'missing-state' })).rejects.toThrow(
        InvalidDeepIdConsentStateException,
      );

      expect(grantRepository.deleteByState).toHaveBeenCalledWith('missing-state');
      expect(deepIdOAuthClient.exchangeCodeForTokens).not.toHaveBeenCalled();
    });
  });
});
