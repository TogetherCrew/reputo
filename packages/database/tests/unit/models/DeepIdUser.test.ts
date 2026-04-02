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
        sub: 'did:plc:pwtlzekayxk67odbhen6v2bb',
        aud: ['9cad9abe-1dc6-4c66-acac-f747026c3beb'],
        auth_time: 1775166617,
        email: 'User@Example.com',
        email_verified: true,
        iat: 1775166619,
        iss: 'https://identity.staging.deep-id.ai',
        picture: 'https://example.com/avatar.png',
        rat: 1775166617,
        username: 'ada',
      };
    });

    test('should correctly validate a valid Deep ID user', async () => {
      const doc = new DeepIdUserModel(deepIdUser);

      await expect(doc.validate()).resolves.toBeUndefined();
      expect(doc.email).toBe('User@Example.com');
    });
  });

  describe('DeepIdUser indexes', () => {
    test('should define the provider and sub compound unique index', () => {
      const indexes = DeepIdUserModel.schema.indexes();
      const providerSubIndex = indexes.find(([fields]) => fields.provider === 1 && fields.sub === 1);

      expect(providerSubIndex?.[1]).toMatchObject({ unique: true });
    });

    test('should not define a unique email index', () => {
      const indexes = DeepIdUserModel.schema.indexes();
      const emailIndex = indexes.find(([fields]) => fields.email === 1);

      expect(emailIndex).toBeUndefined();
    });
  });
});
