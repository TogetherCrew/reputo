import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateKey, type Storage } from '@reputo/storage';
import { stringify } from 'csv-stringify/sync';
import pino from 'pino';

import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

// Extend global type to include storage
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

const logger = pino().child({ activity: 'proposal-engagement' });

interface ProposalRecord {
  id: number;
  roundId: number;
  poolId: number;
  proposerId: number;
  isAwarded: boolean | number;
  isCompleted: boolean | number;
  createdAt: string;
  teamMembers: string;
  rawJson: string;
}

interface ReviewRecord {
  reviewId: number;
  proposalId: number | null;
  reviewerId: number | null;
  reviewType: string;
  overallRating: string;
  createdAt: string | null;
  rawJson: string;
}

interface UserRecord {
  id: number;
  collectionId: string;
  userName: string;
  email: string;
  totalProposals: number;
  rawJson: string;
}

interface ProposalEngagementParams {
  fundedConcludedRewardWeight: number;
  unfundedPenaltyWeight: number;
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

interface ProposalEngagementResult {
  user_id: number;
  proposal_engagement: number;
}

type ProposalClassification = 'funded_concluded' | 'unfunded' | 'other';
type ProposalSkipReason =
  | 'invalid_created_at'
  | 'outside_engagement_window'
  | 'no_community_reviews'
  | 'not_reward_or_penalty_class'
  | null;

interface ProposalEngagementProposalDetail {
  proposal_id: number;
  round_id: number;
  pool_id: number;
  proposer_id: number;
  team_member_ids: number[];
  credited_user_ids: number[];
  credited_collection_ids: string[];
  created_at: string;
  is_awarded: boolean;
  is_completed: boolean;
  classification: ProposalClassification;
  community_review_count: number;
  community_proposal_score_avg: number | null;
  community_proposal_score_norm: number | null;
  tw: number | null;
  age_months: number | null;
  bucket_index: number | null;
  proposal_reward: number;
  proposal_penalty: number;
  scored: boolean;
  skip_reason: ProposalSkipReason;
}

type CreditedRole = 'proposer' | 'team_member';

interface ProposalEngagementAttributionDetail extends ProposalEngagementProposalDetail {
  user_id: number;
  collection_id: string;
  role: CreditedRole;
}

interface ProposalEngagementUserDetail {
  user_id: number;
  collection_id: string;
  proposal_engagement: number;
  proposal_count: number;
  proposals_scored_count: number;
  proposal_positive_sum: number;
  proposal_negative_sum: number;
  proposals: ProposalEngagementAttributionDetail[];
}

interface ProposalEngagementDetailsFile {
  snapshot_id: string;
  algorithm_key: string;
  algorithm_version: string;
  generated_at: string;
  deepfunding_db_key: string;
  params: {
    funded_concluded_reward_weight: number;
    unfunded_penalty_weight: number;
    engagement_window_months: number;
    monthly_decay_rate_percent: number;
    decay_bucket_size_months: number;
  };
  users: ProposalEngagementUserDetail[];
  proposals: ProposalEngagementProposalDetail[];
  stats: {
    total_proposals_seen: number;
    total_proposals_scored: number;
    total_user_attributions: number;
    proposals_with_no_community_reviews: number;
    invalid_created_at: number;
    outside_engagement_window: number;
    not_reward_or_penalty_class: number;
  };
}

function parseParams(inputLocations: Array<{ key: string; value: unknown }>): ProposalEngagementParams {
  const getNumericInput = (keys: string | string[], defaultValue = 0): number => {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const entry = inputLocations.find((i) => keyList.includes(i.key));
    if (!entry || entry.value === undefined || entry.value === null) {
      return defaultValue;
    }
    const n = Number(entry.value);
    if (!Number.isFinite(n)) {
      throw new Error(`Input "${keyList[0]}" has invalid numeric value: ${entry.value}`);
    }
    return n;
  };

  return {
    // New keys (preferred) + backwards-compatible fallbacks (older registry JSON)
    fundedConcludedRewardWeight: getNumericInput([
      'funded_concluded_reward_weight',
      'funded_concluded_proposal_weight',
    ]),
    unfundedPenaltyWeight: getNumericInput(['unfunded_penalty_weight', 'unfunded_proposal_weight']),
    engagementWindowMonths: getNumericInput('engagement_window_months'),
    monthlyDecayRatePercent: getNumericInput('monthly_decay_rate_percent'),
    decayBucketSizeMonths: getNumericInput('decay_bucket_size_months', 1),
  };
}

function calculateTimeWeight(
  createdAt: Date,
  now: Date,
  engagementWindowMonths: number,
  monthlyDecayRatePercent: number,
  decayBucketSizeMonths: number,
): { tw: number; ageMonths: number; bucketIndex: number } {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44); // ~30.44 days per month

  // Outside window → 0
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

function parseTeamMembers(teamMembersJson: string): number[] {
  try {
    const raw = JSON.parse(teamMembersJson) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function buildProposalOwners(proposal: ProposalRecord): Set<number> {
  const owners = new Set<number>();
  owners.add(proposal.proposerId);
  for (const memberId of parseTeamMembers(proposal.teamMembers)) {
    owners.add(memberId);
  }
  return owners;
}

function computeCommunityRatingStats(reviews: ReviewRecord[]): Map<number, { sum: number; count: number }> {
  const byProposal = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (r.reviewType !== 'community') continue;
    if (!r.proposalId) continue;
    const rating = Number.parseFloat(r.overallRating);
    if (!Number.isFinite(rating)) continue;
    // Expected portal range is 1..5; keep loose but avoid negatives
    if (rating < 0) continue;
    const entry = byProposal.get(r.proposalId) ?? { sum: 0, count: 0 };
    entry.sum += rating;
    entry.count += 1;
    byProposal.set(r.proposalId, entry);
  }
  return byProposal;
}

function classifyProposal(p: ProposalRecord): ProposalClassification {
  const isAwarded = p.isAwarded === true || p.isAwarded === 1;
  const isCompleted = p.isCompleted === true || p.isCompleted === 1;

  if (isAwarded && isCompleted) return 'funded_concluded';
  if (!isAwarded) return 'unfunded';
  return 'other';
}

function computeProposalEngagement(
  proposals: ProposalRecord[],
  reviews: ReviewRecord[],
  users: UserRecord[],
  params: ProposalEngagementParams,
  now: Date,
): {
  csv: ProposalEngagementResult[];
  details: Omit<
    ProposalEngagementDetailsFile,
    'snapshot_id' | 'algorithm_key' | 'algorithm_version' | 'generated_at' | 'deepfunding_db_key'
  >;
} {
  // userId -> collectionId
  const userCollectionMap = new Map<number, string>();
  for (const u of users) {
    userCollectionMap.set(u.id, u.collectionId);
  }

  const communityAgg = computeCommunityRatingStats(reviews);

  const userPositive = new Map<number, number>();
  const userNegative = new Map<number, number>();
  const userAttributions = new Map<number, ProposalEngagementAttributionDetail[]>();

  const proposalDetails: ProposalEngagementProposalDetail[] = [];

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

    const community = communityAgg.get(proposal.id);
    const communityCount = community?.count ?? 0;
    const communityAvg = communityCount > 0 && community ? community.sum / communityCount : null;
    const communityNorm = communityAvg !== null ? communityAvg / 5 : null;

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

    // Attribute to all credited users (proposer + team members)
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

  // Per-user details + final score.
  // IMPORTANT: don't rely solely on the users table. Some snapshots may have proposals/reviews
  // populated while the users table is empty or incomplete.
  const userIds = new Set<number>();
  for (const u of users) userIds.add(u.id);
  for (const userId of userAttributions.keys()) userIds.add(userId);

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

  // CSV output: include only users with at least one scored proposal attribution
  const csv: ProposalEngagementResult[] = usersDetails
    .filter((u) => u.proposals_scored_count > 0)
    .map((u) => ({
      user_id: u.user_id,
      proposal_engagement: u.proposal_engagement,
    }));

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
 * Activity implementation for the proposal_engagement algorithm.
 *
 * This algorithm computes proposal engagement scores for users based on:
 * - Funded + concluded proposals (rewarded by community rating)
 * - Unfunded proposals (penalized by low community rating)
 * - Time decay to emphasize recent proposals
 *
 * Input data is fetched from the snapshot-scoped DeepFunding Portal SQLite DB.
 *
 * @param payload - Workflow payload containing snapshot and input locations
 * @returns Output locations for computed results
 */
export async function proposal_engagement(payload: WorkerAlgorithmPayload): Promise<WorkerAlgorithmResult> {
  const { snapshotId, algorithmKey, algorithmVersion, inputLocations } = payload;

  logger.info(
    {
      snapshotId,
      algorithmKey,
      algorithmVersion,
    },
    'Starting proposal_engagement algorithm',
  );

  try {
    const storage = global.storage;
    if (!storage) {
      throw new Error('Storage instance not initialized. Ensure worker is properly started.');
    }

    const params = parseParams(inputLocations);
    logger.info(
      {
        fundedConcludedRewardWeight: params.fundedConcludedRewardWeight,
        unfundedPenaltyWeight: params.unfundedPenaltyWeight,
        engagementWindowMonths: params.engagementWindowMonths,
        monthlyDecayRatePercent: params.monthlyDecayRatePercent,
        decayBucketSizeMonths: params.decayBucketSizeMonths,
      },
      'Parsed algorithm parameters',
    );

    // Snapshot-scoped DeepFunding Portal DB key (generated by pre-step sync)
    const deepfundingDbKey = getInputLocation(inputLocations, 'deepfunding_db_key');

    // Download DB and write to temp file (better-sqlite3 needs a file path)
    const dbBytes = await storage.getObject(deepfundingDbKey);
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

      logger.info(
        {
          proposalCount: proposals.length,
          reviewCount: reviews.length,
          userCount: users.length,
        },
        'Loaded data from DeepFunding Portal database',
      );

      const now = new Date();
      const computed = computeProposalEngagement(proposals, reviews, users, params, now);

      const outputCsv = stringify(computed.csv, {
        header: true,
        columns: ['user_id', 'proposal_engagement'],
      });

      const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`);
      await storage.putObject(outputKey, outputCsv, 'text/csv');

      const detailsKey = generateKey('snapshot', snapshotId, 'proposal_engagement_details.json');
      const details: ProposalEngagementDetailsFile = {
        snapshot_id: snapshotId,
        algorithm_key: algorithmKey,
        algorithm_version: algorithmVersion,
        generated_at: new Date().toISOString(),
        deepfunding_db_key: deepfundingDbKey,
        ...computed.details,
      };
      await storage.putObject(detailsKey, JSON.stringify(details, null, 2), 'application/json');

      logger.info({ outputKey, detailsKey }, 'Uploaded proposal engagement results');

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
  } catch (error) {
    logger.error(
      {
        error: error as Error,
        snapshotId,
        algorithmKey,
      },
      'Failed to compute proposal_engagement',
    );
    throw error;
  }
}
