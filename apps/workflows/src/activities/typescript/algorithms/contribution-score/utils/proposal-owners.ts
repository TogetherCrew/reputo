import type { ProposalRecord } from '@reputo/deepfunding-portal-api';

/**
 * Parse team members JSON string to array of user IDs.
 */
export function parseTeamMembers(teamMembersJson: string): number[] {
  try {
    const raw = JSON.parse(teamMembersJson) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

/**
 * Build a map of user-proposal relationships (proposer or team member).
 * Key format: `${userId}-${proposalId}`
 *
 * @param proposals - Array of proposal records
 * @returns Map indicating if a user is related to a proposal
 */
export function buildRelationMap(proposals: ProposalRecord[]): Map<string, boolean> {
  const relationMap = new Map<string, boolean>();

  for (const proposal of proposals) {
    relationMap.set(`${proposal.proposerId}-${proposal.id}`, true);

    const teamMembers = parseTeamMembers(proposal.teamMembers);
    for (const memberId of teamMembers) {
      relationMap.set(`${memberId}-${proposal.id}`, true);
    }
  }

  return relationMap;
}

/**
 * Build a map of proposal ID to set of owner user IDs (proposer + team members).
 *
 * @param proposals - Array of proposal records
 * @returns Map of proposal ID to set of owner user IDs
 */
export function buildProjectOwnerMap(proposals: ProposalRecord[]): Map<number, Set<number>> {
  const ownerMap = new Map<number, Set<number>>();

  for (const proposal of proposals) {
    const owners = new Set<number>();
    owners.add(proposal.proposerId);

    const teamMembers = parseTeamMembers(proposal.teamMembers);
    for (const memberId of teamMembers) {
      owners.add(memberId);
    }

    ownerMap.set(proposal.id, owners);
  }

  return ownerMap;
}
