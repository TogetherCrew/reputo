import type { DeepIdGrantModel, DeepIdGrantWithId } from '@reputo/database';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepIdGrantRepository } from '../../../src/deep-id-consent/deep-id-grant.repository';

describe('DeepIdGrantRepository', () => {
  let model: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    deleteOne: ReturnType<typeof vi.fn>;
  };
  let repository: DeepIdGrantRepository;

  beforeEach(() => {
    model = {
      create: vi.fn(async () => ({})),
      findOne: vi.fn(),
      deleteOne: vi.fn(),
    };
    repository = new DeepIdGrantRepository(model as unknown as DeepIdGrantModel);
  });

  it('creates a grant document', async () => {
    const data = {
      source: 'voting-portal',
      state: 'state',
      codeVerifier: 'verifier',
      expiresAt: new Date('2026-05-06T12:10:00.000Z'),
    };

    await repository.create(data);

    expect(model.create).toHaveBeenCalledWith(data);
  });

  it('finds an active grant by state with codeVerifier selected', async () => {
    const grant: DeepIdGrantWithId = {
      _id: new Types.ObjectId(),
      source: 'voting-portal',
      state: 'state',
      codeVerifier: 'verifier',
      expiresAt: new Date('2026-05-06T12:10:00.000Z'),
    };
    const exec = vi.fn(async () => grant);
    const lean = vi.fn(() => ({ exec }));
    const select = vi.fn(() => ({ lean }));

    model.findOne.mockReturnValue({ select });

    await expect(repository.findActiveByState('state')).resolves.toBe(grant);

    expect(model.findOne).toHaveBeenCalledWith({
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

    await expect(repository.deleteByState('missing-state')).resolves.toBe(false);

    expect(model.deleteOne).toHaveBeenCalledWith({ state: 'missing-state' });
  });

  it('returns true when deleting an existing grant', async () => {
    const exec = vi.fn(async () => ({ deletedCount: 1 }));
    model.deleteOne.mockReturnValue({ exec });

    await expect(repository.deleteByState('state')).resolves.toBe(true);
  });
});
