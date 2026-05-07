import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AuthSessionWithId, type OAuthProvider, type OAuthUser, type OAuthUserWithId } from '@reputo/database';
import type { Request, Response } from 'express';
import { AUTH_MODE_MOCK, AUTH_MODE_OAUTH } from '../shared/constants';
import {
  type AuthFlowState,
  type AuthRequestContext,
  type CurrentAuthSession,
  type CurrentSessionView,
  getAuthRequestContext,
  type OAuthCallbackQuery,
  type OAuthTokenResponse,
  type OAuthUserInfo,
  type SessionUserView,
  setAuthRequestContext,
} from '../shared/types';
import { createPkceChallenge, createRandomToken, decryptValue, encryptValue } from '../shared/utils';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionRepository } from './auth-session.repository';
import { OAuthAuthProviderService } from './oauth-auth-provider.service';
import { OAuthUserRepository } from './oauth-user.repository';

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

function coerceAudience(value: unknown): string[] | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }

  const values = coerceStringArray(value);
  return values.length > 0 ? values : undefined;
}

function toDateFromNow(seconds: number | undefined, fallbackSeconds: number): Date {
  const effectiveSeconds =
    typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0 ? seconds : fallbackSeconds;
  return new Date(Date.now() + effectiveSeconds * 1000);
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return getHeaderValue(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const firstValue = value.split(',')[0]?.trim();

  return firstValue && firstValue.length > 0 ? firstValue : undefined;
}

@Injectable()
export class AuthService {
  private static readonly UNAUTHORIZED_MESSAGE = 'Authentication required.';
  private static readonly MOCK_SUB = 'did:deep-id:mock-preview-user';
  private static readonly MOCK_EMAIL = 'preview@reputo.local';
  private static readonly MOCK_USERNAME = 'preview-user';
  private readonly tokenEncryptionKey: string;
  private readonly sessionTtlSeconds: number;
  private readonly refreshLeewaySeconds: number;
  private readonly authMode: string;
  private readonly appPublicUrl: string;

  constructor(
    private readonly oauthAuthProviderService: OAuthAuthProviderService,
    private readonly authCookieService: AuthCookieService,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly oauthUserRepository: OAuthUserRepository,
    configService: ConfigService,
  ) {
    this.tokenEncryptionKey = configService.get<string>('auth.tokenEncryptionKey') as string;
    this.sessionTtlSeconds = configService.get<number>('auth.sessionTtlSeconds') as number;
    this.refreshLeewaySeconds = configService.get<number>('auth.refreshLeewaySeconds') as number;
    this.authMode = (configService.get<string>('auth.mode') ?? AUTH_MODE_OAUTH).toLowerCase();
    this.appPublicUrl = configService.get<string>('auth.appPublicUrl') as string;
  }

  async getLoginRedirectUrl(provider: OAuthProvider, request: Request, response: Response): Promise<string> {
    if (this.authMode === AUTH_MODE_MOCK) {
      return this.createMockLoginRedirect(provider, request, response);
    }

    const authFlow = this.createAuthFlow(provider);
    const codeChallenge = createPkceChallenge(authFlow.codeVerifier);
    const redirectUrl = await this.oauthAuthProviderService.buildAuthorizationUrl(provider, authFlow, codeChallenge);

    this.authCookieService.setAuthFlowCookie(response, authFlow);

    return redirectUrl;
  }

  async handleCallback(
    provider: OAuthProvider,
    query: OAuthCallbackQuery,
    request: Request,
    response: Response,
  ): Promise<string> {
    if (this.authMode === AUTH_MODE_MOCK) {
      try {
        return await this.createMockLoginRedirect(provider, request, response);
      } finally {
        this.authCookieService.clearAuthFlowCookie(response);
      }
    }

    const authFlow = this.authCookieService.getAuthFlow(request);

    try {
      if (query.error) {
        throw new UnauthorizedException(query.error_description ?? `OAuth authorization failed: ${query.error}`);
      }

      if (!authFlow?.state || !authFlow.codeVerifier || !authFlow.provider) {
        throw new UnauthorizedException('OAuth auth flow context is missing.');
      }

      if (authFlow.provider !== provider) {
        throw new UnauthorizedException('OAuth auth provider mismatch.');
      }

      if (!query.state || query.state !== authFlow.state) {
        throw new UnauthorizedException('OAuth auth state mismatch.');
      }

      if (!query.code) {
        throw new UnauthorizedException('OAuth authorization code is missing.');
      }

      const tokenResponse = await this.oauthAuthProviderService.exchangeCodeForTokens(
        provider,
        query.code,
        authFlow.codeVerifier,
      );
      const userInfo = await this.oauthAuthProviderService.fetchUserInfo(provider, tokenResponse.access_token);
      const user = await this.syncUserFromUserInfo(provider, userInfo);
      const session = await this.createApplicationSession(user, tokenResponse, authFlow);

      this.authCookieService.setSessionCookie(response, session.sessionId, session.expiresAt);

      return this.appPublicUrl;
    } finally {
      this.authCookieService.clearAuthFlowCookie(response);
    }
  }

  async getCurrentSession(request: Request, response: Response): Promise<CurrentSessionView> {
    const { session, user } = await this.requireSession(request, response);
    return this.toCurrentSessionView(session, user);
  }

  async requireSession(request: Request, response: Response): Promise<AuthRequestContext> {
    const existingContext = getAuthRequestContext(request);

    if (existingContext) {
      return existingContext;
    }

    const sessionId = this.authCookieService.getSessionId(request);

    if (!sessionId) {
      throw new UnauthorizedException(AuthService.UNAUTHORIZED_MESSAGE);
    }

    const session = await this.authSessionRepository.findActiveBySessionId(sessionId, true);

    if (!session) {
      this.authCookieService.clearSessionCookie(response);
      throw new UnauthorizedException(AuthService.UNAUTHORIZED_MESSAGE);
    }

    const activeSession = await this.refreshSessionIfNeeded(session);

    if (!activeSession) {
      this.authCookieService.clearSessionCookie(response);
      throw new UnauthorizedException(AuthService.UNAUTHORIZED_MESSAGE);
    }

    const user = await this.oauthUserRepository.findById(String(activeSession.userId));

    if (!user) {
      await this.authSessionRepository.revokeBySessionId(activeSession.sessionId);
      this.authCookieService.clearSessionCookie(response);
      throw new UnauthorizedException(AuthService.UNAUTHORIZED_MESSAGE);
    }

    this.authCookieService.setSessionCookie(response, activeSession.sessionId, activeSession.expiresAt);

    return setAuthRequestContext(request, {
      session: this.toCurrentAuthSession(activeSession),
      user,
    });
  }

  async logout(session: CurrentAuthSession, response: Response): Promise<void> {
    await this.authSessionRepository.revokeBySessionId(session.sessionId);

    this.authCookieService.clearSessionCookie(response);
    this.authCookieService.clearAuthFlowCookie(response);
  }

  toCurrentSessionView(session: CurrentAuthSession, user: OAuthUserWithId): CurrentSessionView {
    return {
      authenticated: true,
      provider: session.provider,
      expiresAt: session.expiresAt.toISOString(),
      scope: session.scope,
      user: this.toSessionUserView(user),
    };
  }

  private createAuthFlow(provider: OAuthProvider): AuthFlowState {
    return {
      provider,
      state: createRandomToken(24),
      codeVerifier: createRandomToken(32),
    };
  }

  private async createMockLoginRedirect(
    provider: OAuthProvider,
    request: Request,
    response: Response,
  ): Promise<string> {
    const user = await this.oauthUserRepository.upsertBySub(provider, AuthService.MOCK_SUB, {
      email: AuthService.MOCK_EMAIL,
      email_verified: true,
      username: AuthService.MOCK_USERNAME,
    });
    const session = await this.createMockApplicationSession(user, provider);

    this.authCookieService.setSessionCookie(response, session.sessionId, session.expiresAt);

    return this.resolveRequestOrigin(request);
  }

  private resolveRequestOrigin(request: Request): string {
    const protocol = getHeaderValue(request.headers['x-forwarded-proto']) ?? (request.secure ? 'https' : 'http');
    const host = getHeaderValue(request.headers['x-forwarded-host']) ?? getHeaderValue(request.headers.host);

    if (host) {
      return `${protocol}://${host}`;
    }

    return new URL(this.appPublicUrl).origin;
  }

  private async syncUserFromUserInfo(provider: OAuthProvider, userInfo: OAuthUserInfo): Promise<OAuthUserWithId> {
    if (typeof userInfo.sub !== 'string' || userInfo.sub.trim().length === 0) {
      throw new BadGatewayException(
        `OAuth provider ${provider} userinfo response is missing a stable subject identifier.`,
      );
    }

    const update: Omit<OAuthUser, 'provider' | 'sub' | 'createdAt' | 'updatedAt'> = {
      aud: coerceAudience(userInfo.aud),
      auth_time:
        typeof userInfo.auth_time === 'number' && Number.isFinite(userInfo.auth_time) ? userInfo.auth_time : undefined,
      email: typeof userInfo.email === 'string' ? userInfo.email : undefined,
      email_verified: typeof userInfo.email_verified === 'boolean' ? userInfo.email_verified : undefined,
      iat: typeof userInfo.iat === 'number' && Number.isFinite(userInfo.iat) ? userInfo.iat : undefined,
      iss: typeof userInfo.iss === 'string' ? userInfo.iss : undefined,
      picture: typeof userInfo.picture === 'string' ? userInfo.picture : undefined,
      rat: typeof userInfo.rat === 'number' && Number.isFinite(userInfo.rat) ? userInfo.rat : undefined,
      username: typeof userInfo.username === 'string' ? userInfo.username : undefined,
    };

    return this.oauthUserRepository.upsertBySub(provider, userInfo.sub, update);
  }

  private async createApplicationSession(
    user: OAuthUserWithId,
    tokenResponse: OAuthTokenResponse,
    authFlow: AuthFlowState,
  ): Promise<AuthSessionWithId> {
    if (!tokenResponse.refresh_token) {
      throw new BadGatewayException(`OAuth provider ${authFlow.provider} token response is missing the refresh token.`);
    }

    const now = Date.now();
    const sessionAbsoluteExpiry = new Date(now + this.sessionTtlSeconds * 1000);
    const accessTokenExpiresAt = toDateFromNow(tokenResponse.expires_in, this.refreshLeewaySeconds);
    const refreshTokenExpiresAt = toDateFromNow(tokenResponse.refresh_token_expires_in, this.sessionTtlSeconds);
    const expiresAt =
      refreshTokenExpiresAt.getTime() < sessionAbsoluteExpiry.getTime() ? refreshTokenExpiresAt : sessionAbsoluteExpiry;

    return this.authSessionRepository.create({
      sessionId: createRandomToken(32),
      provider: authFlow.provider,
      userId: user._id,
      accessTokenCiphertext: encryptValue(this.tokenEncryptionKey, tokenResponse.access_token),
      refreshTokenCiphertext: encryptValue(this.tokenEncryptionKey, tokenResponse.refresh_token),
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope: scopeToArray(tokenResponse.scope, this.oauthAuthProviderService.getScopes(authFlow.provider)),
      state: authFlow.state,
      codeVerifier: authFlow.codeVerifier,
      expiresAt,
    });
  }

  private async createMockApplicationSession(
    user: OAuthUserWithId,
    provider: OAuthProvider,
  ): Promise<AuthSessionWithId> {
    const expiresAt = new Date(Date.now() + this.sessionTtlSeconds * 1000);

    return this.authSessionRepository.create({
      sessionId: createRandomToken(32),
      provider,
      userId: user._id,
      accessTokenCiphertext: encryptValue(this.tokenEncryptionKey, 'mock-access-token'),
      refreshTokenCiphertext: encryptValue(this.tokenEncryptionKey, 'mock-refresh-token'),
      accessTokenExpiresAt: expiresAt,
      refreshTokenExpiresAt: expiresAt,
      scope: this.oauthAuthProviderService.getScopes(provider),
      state: createRandomToken(24),
      codeVerifier: createRandomToken(32),
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
      const tokenResponse = await this.oauthAuthProviderService.refreshTokens(session.provider, refreshToken);
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
        const userInfo = await this.oauthAuthProviderService.fetchUserInfo(
          session.provider,
          tokenResponse.access_token,
        );
        await this.syncUserFromUserInfo(session.provider, userInfo);
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

  private toCurrentAuthSession(session: AuthSessionWithId): CurrentAuthSession {
    const {
      accessTokenCiphertext: _accessTokenCiphertext,
      refreshTokenCiphertext: _refreshTokenCiphertext,
      state: _state,
      codeVerifier: _codeVerifier,
      ...currentSession
    } = session;

    return currentSession;
  }

  private toSessionUserView(user: OAuthUserWithId): SessionUserView {
    return {
      id: String(user._id),
      provider: user.provider,
      sub: user.sub,
      aud: user.aud,
      auth_time: user.auth_time,
      email: user.email,
      email_verified: user.email_verified,
      iat: user.iat,
      iss: user.iss,
      picture: user.picture,
      rat: user.rat,
      username: user.username,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }
}
