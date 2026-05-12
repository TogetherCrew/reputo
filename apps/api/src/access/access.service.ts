import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type AccessAllowlistWithId, type AccessRole, type OAuthProvider, OAuthProviderDeepId } from '@reputo/database';
import { AccessAllowlistRepository } from './access-allowlist.repository';

export class OwnerEmailConflictError extends Error {
  constructor(
    readonly provider: OAuthProvider,
    readonly configuredOwnerEmail: string,
    readonly activeOwnerEmail: string,
  ) {
    super('OWNER_EMAIL conflicts with an active owner allowlist row.');
    this.name = OwnerEmailConflictError.name;
  }
}

@Injectable()
export class AccessService {
  private readonly logger = new Logger(AccessService.name);
  private readonly ownerEmail?: string;

  constructor(
    private readonly accessAllowlistRepository: AccessAllowlistRepository,
    configService: ConfigService,
  ) {
    this.ownerEmail = configService.get<string>('auth.ownerEmail')?.trim().toLowerCase() || undefined;
  }

  isAllowlisted(provider: OAuthProvider, email: string): Promise<AccessAllowlistWithId | null> {
    return this.accessAllowlistRepository.findActiveByEmail(provider, email);
  }

  async resolveRole(provider: OAuthProvider, email: string): Promise<AccessRole | null> {
    const row = await this.isAllowlisted(provider, email);

    return row?.role ?? null;
  }

  async bootstrapOwner(): Promise<void> {
    if (!this.ownerEmail) {
      return;
    }

    const activeOwner = await this.accessAllowlistRepository.findActiveOwner(OAuthProviderDeepId);

    if (!activeOwner) {
      await this.accessAllowlistRepository.createOwner(OAuthProviderDeepId, this.ownerEmail);
      return;
    }

    if (activeOwner.email === this.ownerEmail) {
      return;
    }

    this.logger.fatal({
      provider: OAuthProviderDeepId,
      configuredOwnerEmail: this.ownerEmail,
      activeOwnerEmail: activeOwner.email,
    });
    throw new OwnerEmailConflictError(OAuthProviderDeepId, this.ownerEmail, activeOwner.email);
  }
}
