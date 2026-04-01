import { createPublicKey, createVerify, constants as cryptoConstants } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeepIdOAuthService } from './deep-id-oauth.service';
import type { DeepIdIdTokenClaims, JsonWebKey } from './types';

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface DecodedJwt<TPayload> {
  header: JwtHeader;
  payload: TPayload;
  signingInput: string;
  signature: Buffer;
}

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

function decodeJwt<TPayload>(token: string): DecodedJwt<TPayload> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new UnauthorizedException('Deep ID ID token is malformed.');
  }

  return {
    header: JSON.parse(decodeBase64Url(encodedHeader).toString('utf8')) as JwtHeader,
    payload: JSON.parse(decodeBase64Url(encodedPayload).toString('utf8')) as TPayload,
    signingInput: `${encodedHeader}.${encodedPayload}`,
    signature: decodeBase64Url(encodedSignature),
  };
}

function hashAlgorithmForJwtAlg(alg: string): string {
  switch (alg) {
    case 'RS256':
    case 'PS256':
    case 'ES256':
      return 'sha256';
    case 'RS384':
    case 'PS384':
    case 'ES384':
      return 'sha384';
    case 'RS512':
    case 'PS512':
    case 'ES512':
      return 'sha512';
    default:
      throw new UnauthorizedException(`Unsupported Deep ID signing algorithm: ${alg}`);
  }
}

function verifyJwtSignature(jwk: JsonWebKey, alg: string, signingInput: string, signature: Buffer): boolean {
  const verifier = createVerify(hashAlgorithmForJwtAlg(alg));
  verifier.update(signingInput);
  verifier.end();

  if (alg.startsWith('PS')) {
    return verifier.verify(
      {
        key: createPublicKey({ key: jwk, format: 'jwk' }),
        padding: cryptoConstants.RSA_PKCS1_PSS_PADDING,
        saltLength: cryptoConstants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature,
    );
  }

  if (alg.startsWith('ES')) {
    return verifier.verify(
      {
        key: createPublicKey({ key: jwk, format: 'jwk' }),
        dsaEncoding: 'ieee-p1363',
      },
      signature,
    );
  }

  return verifier.verify(createPublicKey({ key: jwk, format: 'jwk' }), signature);
}

@Injectable()
export class DeepIdTokenValidationService {
  private readonly issuerUrl: string;
  private readonly clientId: string;

  constructor(
    private readonly deepIdOAuthService: DeepIdOAuthService,
    configService: ConfigService,
  ) {
    this.issuerUrl = (configService.get<string>('auth.deepIdIssuerUrl') as string).replace(/\/+$/u, '');
    this.clientId = configService.get<string>('auth.deepIdClientId') as string;
  }

  async validateIdToken(idToken: string, expectedNonce: string): Promise<DeepIdIdTokenClaims> {
    const decoded = decodeJwt<DeepIdIdTokenClaims>(idToken);

    if (!decoded.header.alg || decoded.header.alg === 'none') {
      throw new UnauthorizedException('Deep ID ID token is missing a supported signing algorithm.');
    }

    const discovery = await this.deepIdOAuthService.getDiscoveryDocument();
    const verified = await this.verifySignature(decoded.header, decoded.signingInput, decoded.signature);

    if (!verified) {
      throw new UnauthorizedException('Deep ID ID token signature is invalid.');
    }

    this.validateClaims(decoded.payload, expectedNonce, discovery.issuer);

    return decoded.payload;
  }

  private async verifySignature(header: JwtHeader, signingInput: string, signature: Buffer): Promise<boolean> {
    const candidateSets = [await this.deepIdOAuthService.getJwks(false), await this.deepIdOAuthService.getJwks(true)];

    for (const jwks of candidateSets) {
      const matchingKeys = (jwks.keys ?? []).filter((key) => {
        if (header.kid && key.kid !== header.kid) {
          return false;
        }

        if (key.use && key.use !== 'sig') {
          return false;
        }

        if (key.alg && header.alg && key.alg !== header.alg) {
          return false;
        }

        return true;
      });

      for (const key of matchingKeys) {
        if (!header.alg) {
          continue;
        }

        if (verifyJwtSignature(key, header.alg, signingInput, signature)) {
          return true;
        }
      }
    }

    return false;
  }

  private validateClaims(claims: DeepIdIdTokenClaims, expectedNonce: string, issuer: string): void {
    const now = Math.floor(Date.now() / 1000);
    const normalizedIssuer = issuer.replace(/\/+$/u, '');

    if (claims.iss !== normalizedIssuer || claims.iss !== this.issuerUrl) {
      throw new UnauthorizedException('Deep ID ID token issuer is invalid.');
    }

    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

    if (!audiences.includes(this.clientId)) {
      throw new UnauthorizedException('Deep ID ID token audience is invalid.');
    }

    if (audiences.length > 1 && claims.azp !== this.clientId) {
      throw new UnauthorizedException('Deep ID ID token authorized party is invalid.');
    }

    if (typeof claims.exp !== 'number' || claims.exp <= now) {
      throw new UnauthorizedException('Deep ID ID token has expired.');
    }

    if (typeof claims.nbf === 'number' && claims.nbf > now) {
      throw new UnauthorizedException('Deep ID ID token is not active yet.');
    }

    if (!claims.sub) {
      throw new UnauthorizedException('Deep ID ID token subject is missing.');
    }

    if (claims.nonce !== expectedNonce) {
      throw new UnauthorizedException('Deep ID ID token nonce is invalid.');
    }
  }
}
