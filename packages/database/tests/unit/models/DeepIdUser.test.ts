import { beforeEach, describe, expect, test } from 'vitest';
import DeepIdUserModel from '../../../src/models/DeepIdUser.model.js';
import { DeepIdProvider } from '../../../src/shared/constants/index.js';
import type { DeepIdUser } from '../../../src/shared/types/index.js';

describe('DeepIdUser model', () => {
  describe('DeepIdUser validation', () => {
    let deepIdUser: DeepIdUser;

    beforeEach(() => {
      deepIdUser = {
        provider: DeepIdProvider,
        did: 'did:pkh:eip155:1:0x1234567890abcdef1234567890abcdef12345678',
        email: 'User@Example.com',
        emailVerified: true,
        name: 'Ada Lovelace',
        givenName: 'Ada',
        familyName: 'Lovelace',
        picture: 'https://example.com/avatar.png',
        walletAddresses: ['0x1234567890abcdef1234567890abcdef12345678'],
        kycVerified: true,
        amr: ['pwd', 'wallet'],
        lastLoginAt: new Date('2026-04-02T08:00:00.000Z'),
      };
    });

    test('should correctly validate a valid Deep ID user', async () => {
      const doc = new DeepIdUserModel(deepIdUser);

      await expect(doc.validate()).resolves.toBeUndefined();
      expect(doc.email).toBe('user@example.com');
    });
  });

  describe('DeepIdUser indexes', () => {
    test('should define the provider and did compound unique index', () => {
      const indexes = DeepIdUserModel.schema.indexes();
      const providerDidIndex = indexes.find(([fields]) => fields.provider === 1 && fields.did === 1);

      expect(providerDidIndex?.[1]).toMatchObject({ unique: true });
    });

    test('should define the optional unique email index', () => {
      const indexes = DeepIdUserModel.schema.indexes();
      const emailIndex = indexes.find(([fields]) => fields.email === 1);

      expect(emailIndex?.[1]).toMatchObject({
        unique: true,
        partialFilterExpression: {
          email: { $exists: true, $type: 'string' },
        },
      });
    });
  });
});
