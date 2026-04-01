import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { ENCRYPTION_VERSION } from '../constants';

function toBase64Url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

function fromBase64Url(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptValue(secret: string, plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [ENCRYPTION_VERSION, toBase64Url(iv), toBase64Url(tag), toBase64Url(ciphertext)].join(':');
}

export function decryptValue(secret: string, encoded: string): string {
  const [version, prefix, ivValue, tagValue, ciphertextValue] = encoded.split(':');

  if (`${version}:${prefix}` !== ENCRYPTION_VERSION || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error('Invalid encrypted value format.');
  }

  const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret), fromBase64Url(ivValue));
  decipher.setAuthTag(fromBase64Url(tagValue));

  const plaintext = Buffer.concat([decipher.update(fromBase64Url(ciphertextValue)), decipher.final()]);

  return plaintext.toString('utf8');
}
