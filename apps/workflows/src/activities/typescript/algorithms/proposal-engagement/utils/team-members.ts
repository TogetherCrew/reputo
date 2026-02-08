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
 * Build set of all owners (proposer + team members) for a proposal.
 * Returns a sorted array for deterministic output.
 */
export function buildProposalOwners(proposal: ProposalRecord): {
  owners: Set<number>;
  ownersArray: number[];
  teamMembersArray: number[];
} {
  const owners = new Set<number>();
  owners.add(proposal.proposerId);

  const teamMembersArray = parseTeamMembers(proposal.teamMembers).sort((a, b) => a - b);
  for (const memberId of teamMembersArray) {
    owners.add(memberId);
  }

  const ownersArray = Array.from(owners.values()).sort((a, b) => a - b);

  return { owners, ownersArray, teamMembersArray };
}
