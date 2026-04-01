import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

function normalizeScopes(value: string | undefined): string[] {
  return (value ?? 'openid profile email offline_access')
    .split(/[,\s]+/u)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export default registerAs('auth', () => ({
  deepIdIssuerUrl: process.env.DEEP_ID_ISSUER_URL,
  deepIdClientId: process.env.DEEP_ID_CLIENT_ID,
  deepIdClientSecret: process.env.DEEP_ID_CLIENT_SECRET,
  deepIdRedirectUri: process.env.DEEP_ID_REDIRECT_URI,
  deepIdScopes: normalizeScopes(process.env.DEEP_ID_SCOPES),
  cookieName: process.env.AUTH_COOKIE_NAME,
  cookieDomain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  cookieSecure: parseBoolean(process.env.AUTH_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  cookieSameSite: (process.env.AUTH_COOKIE_SAME_SITE ?? 'lax').toLowerCase(),
  sessionTtlSeconds: Number(process.env.AUTH_SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 30),
  refreshLeewaySeconds: Number(process.env.AUTH_REFRESH_LEEWAY_SECONDS ?? 60),
  tokenEncryptionKey: process.env.AUTH_TOKEN_ENCRYPTION_KEY,
  appPublicUrl: process.env.APP_PUBLIC_URL,
}));

export const authConfigSchema = {
  DEEP_ID_ISSUER_URL: Joi.string().uri().required().description('Deep ID issuer base URL'),
  DEEP_ID_CLIENT_ID: Joi.string().trim().required().description('Deep ID OAuth client identifier'),
  DEEP_ID_CLIENT_SECRET: Joi.string().trim().required().description('Deep ID OAuth client secret'),
  DEEP_ID_REDIRECT_URI: Joi.string().uri().required().description('Deep ID OAuth callback URL'),
  DEEP_ID_SCOPES: Joi.string()
    .trim()
    .default('openid profile email offline_access')
    .description('Space or comma separated Deep ID scopes'),
  AUTH_COOKIE_NAME: Joi.string().trim().required().description('Opaque auth session cookie name'),
  AUTH_COOKIE_DOMAIN: Joi.string().allow('').optional().description('Optional cookie domain override'),
  AUTH_COOKIE_SECURE: Joi.boolean()
    .truthy('true')
    .truthy('1')
    .falsy('false')
    .falsy('0')
    .default(false)
    .description('Whether auth cookies require HTTPS'),
  AUTH_COOKIE_SAME_SITE: Joi.string()
    .valid('lax', 'strict', 'none', 'Lax', 'Strict', 'None')
    .default('lax')
    .description('Auth cookie SameSite policy'),
  AUTH_SESSION_TTL_SECONDS: Joi.number()
    .integer()
    .positive()
    .default(60 * 60 * 24 * 30)
    .description('Maximum opaque session lifetime in seconds'),
  AUTH_REFRESH_LEEWAY_SECONDS: Joi.number()
    .integer()
    .min(0)
    .default(60)
    .description('Seconds before access token expiry when refresh should happen'),
  AUTH_TOKEN_ENCRYPTION_KEY: Joi.string()
    .trim()
    .min(32)
    .required()
    .description('Secret used to encrypt provider tokens and transient auth flow cookies'),
  APP_PUBLIC_URL: Joi.string().uri().required().description('Public application URL used after login'),
};
