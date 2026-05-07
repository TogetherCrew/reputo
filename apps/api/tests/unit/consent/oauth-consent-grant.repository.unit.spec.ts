import type { OAuthConsentGrantModel, OAuthConsentGrantWithId } from '@reputo/database';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OAuthConsentGrantRepository } from '../../../src/consent/oauth-consent-grant.repository';

describe('OAuthConsentGrantRepository', () => {
  let model: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };
  let repository: OAuthConsentGrantRepository;

  beforeEach(() => {
    model = {
      create: vi.fn(async () => ({})),
      findOne: vi.fn(),
      deleteOne: vi.fn(),
    };
    repository = new OAuthConsentGrantRepository(model as unknown as OAuthConsentGrantModel);
  });

  it('creates a grant document', async () => {
    const data = {
      provider: 'deep-id' as const,
      source: 'voting-portal',
      state: 'state',
      codeVerifier: 'verifier',
      expiresAt: new Date('2026-05-06T12:10:00.000Z'),
    };

    await repository.create(data);

    expect(model.create).toHaveBeenCalledWith(data);
  });

  it('finds an active grant by provider and state with codeVerifier selected', async () => {
    const grant: OAuthConsentGrantWithId = {
      _id: new Types.ObjectId(),
      provider: 'deep-id',
      source: 'voting-portal',
      state: 'state',
      codeVerifier: 'verifier',
      expiresAt: new Date('2026-05-06T12:10:00.000Z'),
    };
    const exec = vi.fn(async () => grant);
    const lean = vi.fn(() => ({ exec }));
    const select = vi.fn(() => ({ lean }));

    model.findOne.mockReturnValue({ select });

    await expect(repository.findActiveByProviderAndState('deep-id', 'state')).resolves.toBe(grant);

    expect(model.findOne).toHaveBeenCalledWith({
      provider: 'deep-id',
      state: 'state',
      expiresAt: { $gt: expect.any(Date) },
    });
    expect(select).toHaveBeenCalledWith('+codeVerifier');
    expect(lean).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
  });

  it('returns false when deleting a missing grant', async () => {
    const exec = vi.fn(async () => ({ deletedCount: 0 }));
    model.deleteOne.mockReturnValue({ exec });

    await expect(repository.deleteByProviderAndState('deep-id', 'missing-state')).resolves.toBe(false);

    expect(model.deleteOne).toHaveBeenCalledWith({ provider: 'deep-id', state: 'missing-state' });
  });

  it('returns true when deleting an existing grant', async () => {
    const exec = vi.fn(async () => ({ deletedCount: 1 }));
    model.deleteOne.mockReturnValue({ exec });

    await expect(repository.deleteByProviderAndState('deep-id', 'state')).resolves.toBe(true);
  });
});
