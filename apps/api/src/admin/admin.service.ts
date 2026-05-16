import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_ROLE_OWNER,
  type AccessAllowlistWithId,
  type AccessRole,
  type OAuthProvider,
  OAuthProviderDeepId,
  type OAuthUserWithId,
} from '@reputo/database';
import { isEmail } from 'class-validator';
import { AuthSessionRepository } from '../sessions';
import { OAuthUserRepository } from '../users';
import { AdminAllowlistRepository } from './admin-allowlist.repository';
import type { AdminViewDto } from './dto';

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
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly ownerEmail?: string;

  constructor(
    private readonly adminAllowlistRepository: AdminAllowlistRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly oauthUserRepository: OAuthUserRepository,
    configService: ConfigService,
  ) {
    this.ownerEmail = configService.get<string>('auth.ownerEmail')?.trim().toLowerCase() || undefined;
  }

  isAllowlisted(provider: OAuthProvider, email: string): Promise<AccessAllowlistWithId | null> {
    return this.adminAllowlistRepository.findActiveByEmail(provider, email);
  }

  async resolveRole(provider: OAuthProvider, email: string): Promise<AccessRole | null> {
    const row = await this.isAllowlisted(provider, email);

    return row?.role ?? null;
  }

  async listAllAccess(): Promise<AdminViewDto[]> {
    const rows = await this.adminAllowlistRepository.listActive(OAuthProviderDeepId);
    const invitedByEmailById = await this.resolveInviterEmails(rows);

    return rows
      .slice()
      .sort((left, right) => {
        if (left.role === ACCESS_ROLE_OWNER && right.role !== ACCESS_ROLE_OWNER) {
          return -1;
        }

        if (left.role !== ACCESS_ROLE_OWNER && right.role === ACCESS_ROLE_OWNER) {
          return 1;
        }

        return left.email.localeCompare(right.email);
      })
      .map((row) => this.toAdminView(row, invitedByEmailById));
  }

  async addAdmin(actor: OAuthUserWithId, email: string): Promise<{ admin: AdminViewDto; created: boolean }> {
    const targetEmail = this.normalizeEmailOrThrow(email);
    const result = await this.adminAllowlistRepository.addAdmin(OAuthProviderDeepId, targetEmail, actor._id);

    if (result.status === 'active') {
      this.logMutation(actor, 'admin.add', targetEmail, 'active_conflict');
      throw new ConflictException('An active allowlist row already exists for this email.');
    }

    this.logMutation(actor, 'admin.add', targetEmail, result.status);

    return {
      admin: this.toAdminView(
        result.doc,
        new Map(actor.email ? [[String(actor._id), this.normalizeEmail(actor.email)]] : []),
      ),
      created: result.status === 'created',
    };
  }

  async removeAdmin(actor: OAuthUserWithId, email: string): Promise<void> {
    const targetEmail = this.normalizeEmailOrThrow(email);
    const actorEmail = actor.email ? this.normalizeEmail(actor.email) : undefined;

    if (actorEmail === targetEmail) {
      this.logMutation(actor, 'admin.remove', targetEmail, 'self_protect');
      throw new ForbiddenException('Owners cannot remove themselves.');
    }

    const revokedAllowlistRow = await this.adminAllowlistRepository.softRevoke(
      OAuthProviderDeepId,
      targetEmail,
      actor._id,
    );

    if (!revokedAllowlistRow) {
      this.logMutation(actor, 'admin.remove', targetEmail, 'not_found');
      throw new NotFoundException('Active allowlist row not found.');
    }

    const targetUser = await this.oauthUserRepository.findByProviderEmail(OAuthProviderDeepId, targetEmail);
    const revokedSessions = targetUser ? await this.authSessionRepository.revokeAllByUserId(targetUser._id) : 0;

    this.logger.log({
      actor: this.toLogActor(actor),
      action: 'admin.remove',
      targetEmail,
      targetUserId: targetUser ? String(targetUser._id) : undefined,
      outcome: 'revoked',
      revokedSessions,
    });
  }

  async seedOwner(): Promise<void> {
    if (!this.ownerEmail) {
      return;
    }

    const activeOwner = await this.adminAllowlistRepository.findActiveOwner(OAuthProviderDeepId);

    if (!activeOwner) {
      await this.adminAllowlistRepository.createOwner(OAuthProviderDeepId, this.ownerEmail);
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

  private async resolveInviterEmails(rows: readonly AccessAllowlistWithId[]): Promise<Map<string, string>> {
    const inviterIds = [
      ...new Set(
        rows
          .map((row) => this.toIdString(row.invitedBy))
          .filter((inviterId): inviterId is string => Boolean(inviterId)),
      ),
    ];
    const inviters = await this.oauthUserRepository.findByIds(inviterIds);

    return new Map(
      inviters
        .filter((inviter) => inviter.email)
        .map((inviter) => [String(inviter._id), this.normalizeEmail(inviter.email as string)]),
    );
  }

  private toAdminView(row: AccessAllowlistWithId, invitedByEmailById: ReadonlyMap<string, string>): AdminViewDto {
    const invitedById = this.toIdString(row.invitedBy);
    const invitedByEmail = invitedById ? invitedByEmailById.get(invitedById) : undefined;

    return {
      email: row.email,
      role: row.role,
      invitedAt: row.invitedAt.toISOString(),
      ...(invitedByEmail ? { invitedByEmail } : {}),
    };
  }

  private normalizeEmailOrThrow(email: string): string {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail || !isEmail(normalizedEmail)) {
      throw new BadRequestException('A valid email address is required.');
    }

    return normalizedEmail;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toIdString(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }

    return String(value);
  }

  private toLogActor(actor: OAuthUserWithId): { email?: string; id: string } {
    return {
      id: String(actor._id),
      ...(actor.email ? { email: this.normalizeEmail(actor.email) } : {}),
    };
  }

  private logMutation(
    actor: OAuthUserWithId,
    action: 'admin.add' | 'admin.remove',
    targetEmail: string,
    outcome: string,
  ): void {
    this.logger.log({
      actor: this.toLogActor(actor),
      action,
      targetEmail,
      outcome,
    });
  }
}
