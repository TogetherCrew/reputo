import { createHash, randomBytes } from 'node:crypto';

export function createRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function createPkceChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier, 'utf8').digest('base64url');
}
