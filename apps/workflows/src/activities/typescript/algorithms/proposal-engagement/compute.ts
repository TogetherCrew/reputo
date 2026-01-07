import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Snapshot } from '@reputo/database';
import { generateKey, type Storage } from '@reputo/storage';
import { Context } from '@temporalio/activity';
import { stringify } from 'csv-stringify/sync';

import config from '../../../../config/index.js';
import type {
  AlgorithmResult,
  CreditedRole,
  ProposalClassification,
  ProposalEngagementAttributionDetail,
  ProposalEngagementDetailsFile,
  ProposalEngagementParams,
  ProposalEngagementProposalDetail,
  ProposalEngagementUserDetail,
  ProposalRecord,
  ProposalSkipReason,
  ReviewRecord,
  UserRecord,
} from '../../../../shared/types/index.js';
import { parseProposalEngagementParams } from '../../../../shared/types/index.js';

/**
 * Calculate time weight based on proposal age and decay parameters.
 */
function calculateTimeWeight(
  createdAt: Date,
  now: Date,
  engagementWindowMonths: number,
  monthlyDecayRatePercent: number,
  decayBucketSizeMonths: number,
): { tw: number; ageMonths: number; bucketIndex: number } {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44);

  if (ageMonths >= engagementWindowMonths) {
    return {
      tw: 0,
      ageMonths,
      bucketIndex: Math.floor(ageMonths / decayBucketSizeMonths),
    };
  }

  const bucketIndex = Math.floor(ageMonths / decayBucketSizeMonths);
  const tw = Math.max(0, 1 - bucketIndex * (monthlyDecayRatePercent / 100));
  return { tw, ageMonths, bucketIndex };
}

/**
 * Parse team members JSON string to array of user IDs.
 */
function parseTeamMembers(teamMembersJson: string): number[] {
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
 */
function buildProposalOwners(proposal: ProposalRecord): Set<number> {
  const owners = new Set<number>();
  owners.add(proposal.proposerId);
  for (const memberId of parseTeamMembers(proposal.teamMembers)) {
    owners.add(memberId);
  }
  return owners;
}

/**
 * Compute average community rating per proposal from reviews.
 */
function computeCommunityRatingStats(reviews: ReviewRecord[]): Map<number, { sum: number; count: number }> {
  const byProposal = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (r.reviewType !== 'community') continue;
    if (!r.proposalId) continue;
    const rating = Number.parseFloat(r.overallRating);
    if (!Number.isFinite(rating)) continue;
    if (rating < 0) continue;
    const entry = byProposal.get(r.proposalId) ?? { sum: 0, count: 0 };
    entry.sum += rating;
    entry.count += 1;
    byProposal.set(r.proposalId, entry);
  }
  return byProposal;
}

/**
 * Classify a proposal based on funding and completion status.
 */
function classifyProposal(p: ProposalRecord): ProposalClassification {
  const isAwarded = p.isAwarded === true || p.isAwarded === 1;
  const isCompleted = p.isCompleted === true || p.isCompleted === 1;

  if (isAwarded && isCompleted) return 'funded_concluded';
  if (!isAwarded) return 'unfunded';
  return 'other';
}

/**
 * Core computation logic for proposal engagement scores.
 */
function computeScores(
  proposals: ProposalRecord[],
  reviews: ReviewRecord[],
  users: UserRecord[],
  params: ProposalEngagementParams,
  now: Date,
) {
  // Build user collection ID map
  const userCollectionMap = new Map<number, string>();
  for (const u of users) {
    userCollectionMap.set(u.id, u.collectionId);
  }

  // Compute community rating aggregates
  const communityAgg = computeCommunityRatingStats(reviews);

  // Tracking maps for user scores
  const userPositive = new Map<number, number>();
  const userNegative = new Map<number, number>();
  const userAttributions = new Map<number, ProposalEngagementAttributionDetail[]>();

  const proposalDetails: ProposalEngagementProposalDetail[] = [];

  // Stats counters
  let totalProposalsScored = 0;
  let totalUserAttributions = 0;
  let proposalsWithNoCommunityReviews = 0;
  let invalidCreatedAt = 0;
  let outsideEngagementWindow = 0;
  let notRewardOrPenaltyClass = 0;

  for (const proposal of proposals) {
    const owners = buildProposalOwners(proposal);
    const ownersArr = Array.from(owners.values()).sort((a, b) => a - b);
    const teamMembers = parseTeamMembers(proposal.teamMembers).sort((a, b) => a - b);

    const isAwarded = proposal.isAwarded === true || proposal.isAwarded === 1;
    const isCompleted = proposal.isCompleted === true || proposal.isCompleted === 1;
    const classification = classifyProposal(proposal);

    // Get community rating stats
    const community = communityAgg.get(proposal.id);
    const communityCount = community?.count ?? 0;
    const communityAvg = communityCount > 0 && community ? community.sum / communityCount : null;
    const communityNorm = communityAvg !== null ? communityAvg / 5 : null;

    // Parse and validate created_at date
    const createdAt = new Date(proposal.createdAt);
    const createdAtValid = !Number.isNaN(createdAt.getTime());

    let tw: number | null = null;
    let ageMonths: number | null = null;
    let bucketIndex: number | null = null;
    let skipReason: ProposalSkipReason = null;

    if (!createdAtValid) {
      invalidCreatedAt++;
      skipReason = 'invalid_created_at';
    } else {
      const computed = calculateTimeWeight(
        createdAt,
        now,
        params.engagementWindowMonths,
        params.monthlyDecayRatePercent,
        params.decayBucketSizeMonths,
      );
      tw = computed.tw;
      ageMonths = computed.ageMonths;
      bucketIndex = computed.bucketIndex;

      if (tw === 0) {
        outsideEngagementWindow++;
        skipReason = 'outside_engagement_window';
      }
    }

    if (skipReason === null && communityNorm === null) {
      proposalsWithNoCommunityReviews++;
      skipReason = 'no_community_reviews';
    }

    if (skipReason === null && classification === 'other') {
      notRewardOrPenaltyClass++;
      skipReason = 'not_reward_or_penalty_class';
    }

    const twValue = tw ?? 0;
    const normValue = communityNorm ?? 0;

    let proposalReward = 0;
    let proposalPenalty = 0;
    let scored = false;

    if (skipReason === null && twValue > 0 && communityNorm !== null) {
      if (classification === 'funded_concluded') {
        proposalReward = twValue * normValue;
        scored = proposalReward !== 0;
      } else if (classification === 'unfunded') {
        proposalPenalty = twValue * (1 - normValue);
        scored = proposalPenalty !== 0;
      }
    }

    if (scored) {
      totalProposalsScored++;
    }

    const creditedCollectionIds = ownersArr.map((id) => userCollectionMap.get(id) ?? String(id));

    const baseProposalDetail: ProposalEngagementProposalDetail = {
      proposal_id: proposal.id,
      round_id: proposal.roundId,
      pool_id: proposal.poolId,
      proposer_id: proposal.proposerId,
      team_member_ids: teamMembers,
      credited_user_ids: ownersArr,
      credited_collection_ids: creditedCollectionIds,
      created_at: proposal.createdAt,
      is_awarded: isAwarded,
      is_completed: isCompleted,
      classification,
      community_review_count: communityCount,
      community_proposal_score_avg: communityAvg,
      community_proposal_score_norm: communityNorm,
      tw,
      age_months: ageMonths,
      bucket_index: bucketIndex,
      proposal_reward: proposalReward,
      proposal_penalty: proposalPenalty,
      scored,
      skip_reason: skipReason,
    };

    proposalDetails.push(baseProposalDetail);

    // Attribute to all owners
    for (const userId of ownersArr) {
      const collectionId = userCollectionMap.get(userId) ?? String(userId);
      const role: CreditedRole = userId === proposal.proposerId ? 'proposer' : 'team_member';

      const attribution: ProposalEngagementAttributionDetail = {
        ...baseProposalDetail,
        user_id: userId,
        collection_id: collectionId,
        role,
      };

      const existing = userAttributions.get(userId) ?? [];
      existing.push(attribution);
      userAttributions.set(userId, existing);
      totalUserAttributions++;

      if (proposalReward !== 0) {
        userPositive.set(userId, (userPositive.get(userId) ?? 0) + proposalReward);
      }
      if (proposalPenalty !== 0) {
        userNegative.set(userId, (userNegative.get(userId) ?? 0) + proposalPenalty);
      }
    }
  }

  // Collect all user IDs
  const userIds = new Set<number>();
  for (const u of users) userIds.add(u.id);
  for (const userId of userAttributions.keys()) userIds.add(userId);

  // Build user details
  const usersDetails: ProposalEngagementUserDetail[] = Array.from(userIds)
    .sort((a, b) => a - b)
    .map((userId) => {
      const attributions = userAttributions.get(userId) ?? [];

      const pos = userPositive.get(userId) ?? 0;
      const neg = userNegative.get(userId) ?? 0;
      const score = params.fundedConcludedRewardWeight * pos - params.unfundedPenaltyWeight * neg;

      attributions.sort((a, b) => {
        const t = a.created_at.localeCompare(b.created_at);
        if (t !== 0) return t;
        return a.proposal_id - b.proposal_id;
      });

      const scoredCount = attributions.filter((p) => p.scored).length;

      return {
        user_id: userId,
        collection_id: userCollectionMap.get(userId) ?? String(userId),
        proposal_engagement: score,
        proposal_count: attributions.length,
        proposals_scored_count: scoredCount,
        proposal_positive_sum: pos,
        proposal_negative_sum: neg,
        proposals: attributions,
      };
    });

  // Build CSV output (only users with scored proposals)
  const csv = usersDetails
    .filter((u) => u.proposals_scored_count > 0)
    .map((u) => ({
      user_id: u.user_id,
      proposal_engagement: u.proposal_engagement,
    }));

  // Sort proposal details
  proposalDetails.sort((a, b) => {
    const aValid = a.skip_reason !== 'invalid_created_at';
    const bValid = b.skip_reason !== 'invalid_created_at';
    if (aValid !== bValid) return aValid ? -1 : 1;
    if (aValid && bValid) {
      const t = a.created_at.localeCompare(b.created_at);
      if (t !== 0) return t;
    }
    return a.proposal_id - b.proposal_id;
  });

  return {
    csv,
    details: {
      params: {
        funded_concluded_reward_weight: params.fundedConcludedRewardWeight,
        unfunded_penalty_weight: params.unfundedPenaltyWeight,
        engagement_window_months: params.engagementWindowMonths,
        monthly_decay_rate_percent: params.monthlyDecayRatePercent,
        decay_bucket_size_months: params.decayBucketSizeMonths,
      },
      users: usersDetails,
      proposals: proposalDetails,
      stats: {
        total_proposals_seen: proposals.length,
        total_proposals_scored: totalProposalsScored,
        total_user_attributions: totalUserAttributions,
        proposals_with_no_community_reviews: proposalsWithNoCommunityReviews,
        invalid_created_at: invalidCreatedAt,
        outside_engagement_window: outsideEngagementWindow,
        not_reward_or_penalty_class: notRewardOrPenaltyClass,
      },
    },
  };
}

/**
 * Computes proposal engagement scores for users.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeProposalEngagement(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const snapshotId = String((snapshot as unknown as { _id: string })._id);
  const { key: algorithmKey, version: algorithmVersion, inputs } = snapshot.algorithmPresetFrozen;
  const logger = Context.current().log;

  logger.info('Starting proposal_engagement algorithm', {
    snapshotId,
    algorithmKey,
    algorithmVersion,
  });

  const { bucket } = config.storage;

  // Parse parameters from inputs
  const params = parseProposalEngagementParams(inputs);

  logger.info('Parsed algorithm parameters', {
    fundedConcludedRewardWeight: params.fundedConcludedRewardWeight,
    unfundedPenaltyWeight: params.unfundedPenaltyWeight,
    engagementWindowMonths: params.engagementWindowMonths,
    monthlyDecayRatePercent: params.monthlyDecayRatePercent,
    decayBucketSizeMonths: params.decayBucketSizeMonths,
  });

  // Download DeepFunding database from storage
  // Dependencies are resolved at the workflow level before this is called
  const deepfundingDbKey = `snapshots/${snapshotId}/deepfunding.db`;

  const dbBytes = await storage.getObject({
    bucket,
    key: deepfundingDbKey,
  });
  const tempDir = await mkdtemp(join(tmpdir(), `reputo-deepfundingdb-${snapshotId}-`));
  const localDbPath = join(tempDir, 'deepfunding.db');
  await writeFile(localDbPath, dbBytes);

  const { initializeDb, closeDb, proposalsRepo, reviewsRepo, usersRepo } = await import(
    '@reputo/deepfunding-portal-api'
  );

  initializeDb({ path: localDbPath });

  try {
    const proposals = proposalsRepo.findAll() as ProposalRecord[];
    const reviews = reviewsRepo.findAll() as ReviewRecord[];
    const users = usersRepo.findAll() as UserRecord[];

    logger.info('Loaded data from DeepFunding Portal database', {
      proposalCount: proposals.length,
      reviewCount: reviews.length,
      userCount: users.length,
    });

    // Execute computation
    const now = new Date();
    const computed = computeScores(proposals, reviews, users, params, now);

    // Generate and upload CSV output
    const outputCsv = stringify(computed.csv, {
      header: true,
      columns: ['user_id', 'proposal_engagement'],
    });

    const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`);
    await storage.putObject({
      bucket,
      key: outputKey,
      body: outputCsv,
      contentType: 'text/csv',
    });

    // Generate and upload details JSON
    const detailsKey = generateKey('snapshot', snapshotId, 'proposal_engagement_details.json');
    const details: ProposalEngagementDetailsFile = {
      snapshot_id: snapshotId,
      algorithm_key: algorithmKey,
      algorithm_version: algorithmVersion,
      generated_at: new Date().toISOString(),
      deepfunding_db_key: deepfundingDbKey,
      ...computed.details,
    };
    await storage.putObject({
      bucket,
      key: detailsKey,
      body: JSON.stringify(details, null, 2),
      contentType: 'application/json',
    });

    logger.info('Uploaded proposal engagement results', {
      outputKey,
      detailsKey,
    });

    return {
      outputs: {
        proposal_engagement: outputKey,
        proposal_engagement_details: detailsKey,
      },
    };
  } finally {
    closeDb();
    await rm(tempDir, { recursive: true, force: true });
  }
}
