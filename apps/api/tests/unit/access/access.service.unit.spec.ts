import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessService, OwnerEmailConflictError } from '../../../src/access';

describe('AccessService', () => {
  const accessAllowlistRepository = {
    findActiveByEmail: vi.fn(),
    findActiveOwner: vi.fn(),
    createOwner: vi.fn(),
  };

  function createService(ownerEmail?: string) {
    const configService = {
      get: vi.fn((key: string) => (key === 'auth.ownerEmail' ? ownerEmail : undefined)),
    } as unknown as ConfigService;

    return new AccessService(accessAllowlistRepository as never, configService);
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('resolves an active allowlist role', async () => {
    const service = createService();

    accessAllowlistRepository.findActiveByEmail.mockResolvedValue({
      _id: new Types.ObjectId(),
      provider: 'deep-id',
      email: 'admin@example.com',
      role: 'admin',
      invitedAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    await expect(service.resolveRole('deep-id', 'ADMIN@example.com')).resolves.toBe('admin');
    expect(accessAllowlistRepository.findActiveByEmail).toHaveBeenCalledWith('deep-id', 'ADMIN@example.com');
  });

  it('returns null when no active allowlist role exists', async () => {
    const service = createService();

    accessAllowlistRepository.findActiveByEmail.mockResolvedValue(null);

    await expect(service.resolveRole('deep-id', 'missing@example.com')).resolves.toBeNull();
  });

  it('bootstraps the configured owner when no active owner exists', async () => {
    const service = createService('owner@example.com');

    accessAllowlistRepository.findActiveOwner.mockResolvedValue(null);

    await service.bootstrapOwner();

    expect(accessAllowlistRepository.createOwner).toHaveBeenCalledWith('deep-id', 'owner@example.com');
  });

  it('does not write when the active owner already matches OWNER_EMAIL', async () => {
    const service = createService('owner@example.com');

    accessAllowlistRepository.findActiveOwner.mockResolvedValue({
      _id: new Types.ObjectId(),
      provider: 'deep-id',
      email: 'owner@example.com',
      role: 'owner',
      invitedAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    await service.bootstrapOwner();

    expect(accessAllowlistRepository.createOwner).not.toHaveBeenCalled();
  });

  it('logs fatal and throws when an active owner conflicts with OWNER_EMAIL', async () => {
    const loggerFatalSpy = vi.spyOn(Logger.prototype, 'fatal').mockImplementation(() => undefined);
    const service = createService('owner@example.com');

    accessAllowlistRepository.findActiveOwner.mockResolvedValue({
      _id: new Types.ObjectId(),
      provider: 'deep-id',
      email: 'other@example.com',
      role: 'owner',
      invitedAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    await expect(service.bootstrapOwner()).rejects.toThrow(OwnerEmailConflictError);

    expect(loggerFatalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'deep-id',
        configuredOwnerEmail: 'owner@example.com',
        activeOwnerEmail: 'other@example.com',
      }),
    );
    expect(accessAllowlistRepository.createOwner).not.toHaveBeenCalled();

    loggerFatalSpy.mockRestore();
  });

  it('skips owner bootstrap when OWNER_EMAIL is not configured', async () => {
    const service = createService(undefined);

    await service.bootstrapOwner();

    expect(accessAllowlistRepository.findActiveOwner).not.toHaveBeenCalled();
    expect(accessAllowlistRepository.createOwner).not.toHaveBeenCalled();
  });
});
