import { createHash, randomBytes } from 'node:crypto';
import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AuthSessionWithId, DeepIdProvider, type DeepIdUser, type DeepIdUserWithId } from '@reputo/database';
import type { Request, Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionRepository } from './auth-session.repository';
import { DeepIdOAuthService } from './deep-id-oauth.service';
import { DeepIdTokenValidationService } from './deep-id-token-validation.service';
import { DeepIdUserRepository } from './deep-id-user.repository';
import type {
  DeepIdAuthFlowState,
  DeepIdCallbackQuery,
  DeepIdCurrentSession,
  DeepIdSessionUserView,
  DeepIdTokenResponse,
  DeepIdUserInfo,
} from './types';
import { decryptValue, encryptValue } from './utils';

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

function createRandomToken(bytes = 32): string {
  return toBase64Url(randomBytes(bytes));
}

function createPkceChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier, 'utf8').digest('base64url');
}

function scopeToArray(scope: string | undefined, fallback: string[]): string[] {
  if (!scope) {
    return fallback;
  }

  return scope
    .split(/[,\s]+/u)
    .map((value) => value.trim())
    .filter(Boolean);
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toDateFromNow(seconds: number | undefined, fallbackSeconds: number): Date {
  const effectiveSeconds =
    typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0 ? seconds : fallbackSeconds;
  return new Date(Date.now() + effectiveSeconds * 1000);
}

@Injectable()
export class DeepIdAuthService {
  private readonly tokenEncryptionKey: string;
  private readonly sessionTtlSeconds: number;
  private readonly refreshLeewaySeconds: number;
  private readonly appPublicUrl: string;
  private readonly requestedScopes: string[];

  constructor(
    private readonly deepIdOAuthService: DeepIdOAuthService,
    private readonly deepIdTokenValidationService: DeepIdTokenValidationService,
    private readonly authCookieService: AuthCookieService,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly deepIdUserRepository: DeepIdUserRepository,
    configService: ConfigService,
  ) {
    this.tokenEncryptionKey = configService.get<string>('auth.tokenEncryptionKey') as string;
    this.sessionTtlSeconds = configService.get<number>('auth.sessionTtlSeconds') as number;
    this.refreshLeewaySeconds = configService.get<number>('auth.refreshLeewaySeconds') as number;
    this.appPublicUrl = configService.get<string>('auth.appPublicUrl') as string;
    this.requestedScopes = configService.get<string[]>('auth.deepIdScopes') as string[];
  }

  async getLoginRedirectUrl(response: Response): Promise<string> {
    const authFlow = this.createAuthFlow();
    const codeChallenge = createPkceChallenge(authFlow.codeVerifier);
    const redirectUrl = await this.deepIdOAuthService.buildAuthorizationUrl(authFlow, codeChallenge);

    this.authCookieService.setAuthFlowCookie(response, authFlow);

    return redirectUrl;
  }

  async handleCallback(query: DeepIdCallbackQuery, request: Request, response: Response): Promise<string> {
    const authFlow = this.authCookieService.getAuthFlow(request);

    try {
      if (query.error) {
        throw new UnauthorizedException(query.error_description ?? `Deep ID authorization failed: ${query.error}`);
      }

      if (!authFlow?.state || !authFlow.nonce || !authFlow.codeVerifier) {
        throw new UnauthorizedException('Deep ID auth flow context is missing.');
      }

      if (!query.state || query.state !== authFlow.state) {
        throw new UnauthorizedException('Deep ID auth state mismatch.');
      }

      if (!query.code) {
        throw new UnauthorizedException('Deep ID authorization code is missing.');
      }

      const tokenResponse = await this.deepIdOAuthService.exchangeCodeForTokens(query.code, authFlow.codeVerifier);

      if (!tokenResponse.id_token) {
        throw new BadGatewayException('Deep ID token response is missing the ID token.');
      }

      const claims = await this.deepIdTokenValidationService.validateIdToken(tokenResponse.id_token, authFlow.nonce);
      const userInfo = await this.deepIdOAuthService.fetchUserInfo(tokenResponse.access_token);
      const user = await this.syncUserFromUserInfo(userInfo, claims.sub, claims.amr, true);
      const session = await this.createApplicationSession(user, tokenResponse, authFlow);

      this.authCookieService.setSessionCookie(response, session.sessionId, session.expiresAt);

      return this.appPublicUrl;
    } finally {
      this.authCookieService.clearAuthFlowCookie(response);
    }
  }

  async getCurrentSession(request: Request, response: Response): Promise<DeepIdCurrentSession> {
    const sessionId = this.authCookieService.getSessionId(request);

    if (!sessionId) {
      return { authenticated: false };
    }

    const session = await this.authSessionRepository.findActiveBySessionId(sessionId, true);

    if (!session) {
      this.authCookieService.clearSessionCookie(response);
      return { authenticated: false };
    }

    const activeSession = await this.refreshSessionIfNeeded(session);

    if (!activeSession) {
      this.authCookieService.clearSessionCookie(response);
      return { authenticated: false };
    }

    const user = await this.deepIdUserRepository.findById(String(activeSession.userId));

    if (!user) {
      await this.authSessionRepository.revokeBySessionId(activeSession.sessionId);
      this.authCookieService.clearSessionCookie(response);
      return { authenticated: false };
    }

    this.authCookieService.setSessionCookie(response, activeSession.sessionId, activeSession.expiresAt);

    return {
      authenticated: true,
      provider: DeepIdProvider,
      expiresAt: activeSession.expiresAt.toISOString(),
      scope: activeSession.scope,
      user: this.toSessionUserView(user),
    };
  }

  async logout(request: Request, response: Response): Promise<void> {
    const sessionId = this.authCookieService.getSessionId(request);

    if (sessionId) {
      await this.authSessionRepository.revokeBySessionId(sessionId);
    }

    this.authCookieService.clearSessionCookie(response);
    this.authCookieService.clearAuthFlowCookie(response);
  }

  private createAuthFlow(): DeepIdAuthFlowState {
    return {
      state: createRandomToken(24),
      nonce: createRandomToken(24),
      codeVerifier: createRandomToken(32),
    };
  }

  private async syncUserFromUserInfo(
    userInfo: DeepIdUserInfo,
    fallbackSubject: string | undefined,
    fallbackAmr: string[] | undefined,
    touchLastLogin: boolean,
  ): Promise<DeepIdUserWithId> {
    const did = this.resolveUserDid(userInfo, fallbackSubject);

    if (!did) {
      throw new BadGatewayException('Deep ID userinfo response is missing a stable subject identifier.');
    }

    const update: Omit<DeepIdUser, 'provider' | 'did' | 'createdAt' | 'updatedAt'> = {
      emailVerified: Boolean(userInfo.email_verified),
      walletAddresses: coerceStringArray(userInfo.wallet_addresses ?? userInfo.walletAddresses),
      kycVerified: Boolean(userInfo.kyc_verified ?? userInfo.kycVerified),
      amr: coerceStringArray(userInfo.amr ?? fallbackAmr),
    };

    if (typeof userInfo.email === 'string') {
      update.email = userInfo.email;
    }

    if (typeof userInfo.name === 'string') {
      update.name = userInfo.name;
    }

    if (typeof userInfo.given_name === 'string') {
      update.givenName = userInfo.given_name;
    }

    if (typeof userInfo.family_name === 'string') {
      update.familyName = userInfo.family_name;
    }

    if (typeof userInfo.picture === 'string') {
      update.picture = userInfo.picture;
    }

    if (touchLastLogin) {
      update.lastLoginAt = new Date();
    }

    return this.deepIdUserRepository.upsertByDid(DeepIdProvider, did, update);
  }

  private resolveUserDid(userInfo: DeepIdUserInfo, fallbackSubject: string | undefined): string | undefined {
    const candidates = [userInfo.did, userInfo.sub, fallbackSubject];

    return candidates.find(
      (candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0,
    );
  }

  private async createApplicationSession(
    user: DeepIdUserWithId,
    tokenResponse: DeepIdTokenResponse,
    authFlow: DeepIdAuthFlowState,
  ): Promise<AuthSessionWithId> {
    if (!tokenResponse.refresh_token) {
      throw new BadGatewayException('Deep ID token response is missing the refresh token.');
    }

    const now = Date.now();
    const sessionAbsoluteExpiry = new Date(now + this.sessionTtlSeconds * 1000);
    const accessTokenExpiresAt = toDateFromNow(tokenResponse.expires_in, this.refreshLeewaySeconds);
    const refreshTokenExpiresAt = toDateFromNow(tokenResponse.refresh_token_expires_in, this.sessionTtlSeconds);
    const expiresAt =
      refreshTokenExpiresAt.getTime() < sessionAbsoluteExpiry.getTime() ? refreshTokenExpiresAt : sessionAbsoluteExpiry;

    return this.authSessionRepository.create({
      sessionId: createRandomToken(32),
      provider: DeepIdProvider,
      userId: user._id,
      accessTokenCiphertext: encryptValue(this.tokenEncryptionKey, tokenResponse.access_token),
      refreshTokenCiphertext: encryptValue(this.tokenEncryptionKey, tokenResponse.refresh_token),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope: scopeToArray(tokenResponse.scope, this.requestedScopes),
      nonce: authFlow.nonce,
      state: authFlow.state,
      codeVerifier: authFlow.codeVerifier,
      expiresAt,
    });
  }

  private async refreshSessionIfNeeded(session: AuthSessionWithId): Promise<AuthSessionWithId | null> {
    const refreshThreshold = Date.now() + this.refreshLeewaySeconds * 1000;

    if (session.accessTokenExpiresAt.getTime() > refreshThreshold) {
      return session;
    }

    if (session.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await this.authSessionRepository.revokeBySessionId(session.sessionId);
      return null;
    }

    try {
      const refreshToken = decryptValue(this.tokenEncryptionKey, session.refreshTokenCiphertext);
      const tokenResponse = await this.deepIdOAuthService.refreshTokens(refreshToken);
      const accessTokenExpiresAt = toDateFromNow(tokenResponse.expires_in, this.refreshLeewaySeconds);
      const nextRefreshToken = tokenResponse.refresh_token
        ? encryptValue(this.tokenEncryptionKey, tokenResponse.refresh_token)
        : session.refreshTokenCiphertext;
      const nextRefreshTokenExpiresAt =
        typeof tokenResponse.refresh_token_expires_in === 'number'
          ? toDateFromNow(tokenResponse.refresh_token_expires_in, this.sessionTtlSeconds)
          : session.refreshTokenExpiresAt;
      const expiresAt =
        nextRefreshTokenExpiresAt.getTime() < session.expiresAt.getTime()
          ? nextRefreshTokenExpiresAt
          : session.expiresAt;

      const updatedSession = await this.authSessionRepository.updateAfterRefresh(session.sessionId, {
        accessTokenCiphertext: encryptValue(this.tokenEncryptionKey, tokenResponse.access_token),
        refreshTokenCiphertext: nextRefreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt: nextRefreshTokenExpiresAt,
        scope: scopeToArray(tokenResponse.scope, session.scope),
        lastRefreshedAt: new Date(),
        expiresAt,
      });

      if (!updatedSession) {
        return null;
      }

      try {
        const userInfo = await this.deepIdOAuthService.fetchUserInfo(tokenResponse.access_token);
        const did = this.resolveUserDid(userInfo, undefined);

        if (did) {
          await this.syncUserFromUserInfo(userInfo, did, undefined, false);
        }
      } catch {
        // Preserve session viability even if profile refresh is temporarily unavailable.
      }

      return {
        ...updatedSession,
        refreshTokenCiphertext: nextRefreshToken,
      };
    } catch {
      await this.authSessionRepository.revokeBySessionId(session.sessionId);
      return null;
    }
  }

  private toSessionUserView(user: DeepIdUserWithId): DeepIdSessionUserView {
    return {
      id: String(user._id),
      did: user.did,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      givenName: user.givenName,
      familyName: user.familyName,
      picture: user.picture,
      walletAddresses: user.walletAddresses,
      kycVerified: user.kycVerified,
      amr: user.amr,
    };
  }
}
