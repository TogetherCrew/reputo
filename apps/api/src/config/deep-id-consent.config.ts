import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface DeepIdConsentSourceConfig {
  returnUrl: string;
  scope: string;
}

export interface DeepIdConsentConfig {
  grantTtlSeconds: number;
  redirectUri: string;
  sources: Record<string, DeepIdConsentSourceConfig>;
}

export default registerAs(
  'deepIdConsent',
  (): DeepIdConsentConfig => ({
    redirectUri: process.env.DEEP_ID_CONSENT_REDIRECT_URI as string,
    grantTtlSeconds: Number(process.env.DEEP_ID_GRANT_TTL_SECONDS),
    sources: {
      'voting-portal': {
        returnUrl: process.env.VOTING_PORTAL_RETURN_URL as string,
        scope: process.env.VOTING_PORTAL_SCOPES as string,
      },
    },
  }),
);

export const deepIdConsentConfigSchema = {
  DEEP_ID_CONSENT_REDIRECT_URI: Joi.string()
    .uri()
    .required()
    .description('Deep ID OAuth callback URL for consent flows'),
  DEEP_ID_GRANT_TTL_SECONDS: Joi.number()
    .integer()
    .positive()
    .required()
    .description('Transient Deep ID consent grant lifetime in seconds'),
  VOTING_PORTAL_RETURN_URL: Joi.string().uri().required().description('Voting Portal return URL after consent'),
  VOTING_PORTAL_SCOPES: Joi.string().required().description('Deep ID scopes requested for Voting Portal consent'),
};
