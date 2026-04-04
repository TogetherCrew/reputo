import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AUTH_FLOW_COOKIE_SUFFIX } from '../shared/constants';
import type { DeepIdAuthFlowState } from '../shared/types';
import { decryptValue, encryptValue } from '../shared/utils';

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      accumulator[key] = value;
      return accumulator;
    }, {});
}

@Injectable()
export class AuthCookieService {
  private readonly cookieName: string;
  private readonly authFlowCookieName: string;
  private readonly encryptionKey: string;
  private readonly cookieOptions: CookieOptions;

  constructor(configService: ConfigService) {
    this.cookieName = configService.get<string>('auth.cookieName') as string;
    this.authFlowCookieName = `${this.cookieName}${AUTH_FLOW_COOKIE_SUFFIX}`;
    this.encryptionKey = configService.get<string>('auth.tokenEncryptionKey') as string;
    this.cookieOptions = {
      httpOnly: true,
      secure: configService.get<boolean>('auth.cookieSecure') as boolean,
      sameSite: (configService.get<string>('auth.cookieSameSite') as CookieOptions['sameSite']) ?? 'lax',
      domain: configService.get<string | undefined>('auth.cookieDomain'),
      path: '/',
    };
  }

  getSessionId(request: Request): string | undefined {
    return parseCookieHeader(request.headers.cookie)[this.cookieName];
  }

  setSessionCookie(response: Response, sessionId: string, expiresAt: Date): void {
    response.cookie(this.cookieName, sessionId, {
      ...this.cookieOptions,
      expires: expiresAt,
    });
  }

  clearSessionCookie(response: Response): void {
    response.clearCookie(this.cookieName, this.cookieOptions);
  }

  setAuthFlowCookie(response: Response, authFlow: DeepIdAuthFlowState): void {
    const encrypted = encryptValue(this.encryptionKey, JSON.stringify(authFlow));

    response.cookie(this.authFlowCookieName, encrypted, {
      ...this.cookieOptions,
      maxAge: 10 * 60 * 1000,
    });
  }

  getAuthFlow(request: Request): DeepIdAuthFlowState | null {
    const encrypted = parseCookieHeader(request.headers.cookie)[this.authFlowCookieName];

    if (!encrypted) {
      return null;
    }

    try {
      return JSON.parse(decryptValue(this.encryptionKey, encrypted)) as DeepIdAuthFlowState;
    } catch {
      return null;
    }
  }

  clearAuthFlowCookie(response: Response): void {
    response.clearCookie(this.authFlowCookieName, this.cookieOptions);
  }
}
