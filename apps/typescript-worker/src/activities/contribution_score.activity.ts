import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateKey, type Storage } from '@reputo/storage';
import { stringify } from 'csv-stringify/sync';
import pino from 'pino';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';
import { getInputLocation } from './utils.js';

// Extend global type to include storage and deepfunding db
declare global {
  // eslint-disable-next-line no-var
  var storage: Storage | undefined;
}

// Create activity-specific logger
const logger = pino().child({ activity: 'contribution-score' });

/**
 * Comment record from DeepFunding Portal database
 */
interface CommentRecord {
  commentId: number;
  parentId: number;
  isReply: boolean | number;
  userId: number;
  proposalId: number;
  content: string;
  commentVotes: string;
  createdAt: string;
  updatedAt: string;
  rawJson: string;
}

/**
 * Comment vote record from DeepFunding Portal database
 */
interface CommentVoteRecord {
  voterId: number;
  commentId: number;
  voteType: string;
  createdAt: string | null;
  rawJson: string;
}

/**
 * Proposal record from DeepFunding Portal database
 */
interface ProposalRecord {
  id: number;
  roundId: number;
  poolId: number;
  proposerId: number;
  title: string;
  content: string;
  link: string;
  featureImage: string;
  requestedAmount: string;
  awardedAmount: string;
  isAwarded: boolean | number;
  isCompleted: boolean | number;
  createdAt: string;
  updatedAt: string | null;
  teamMembers: string;
  rawJson: string;
}

/**
 * User record from DeepFunding Portal database
 */
interface UserRecord {
  id: number;
  collectionId: string;
  userName: string;
  email: string;
  totalProposals: number;
  rawJson: string;
}

/**
 * Algorithm parameters extracted from input locations
 */
interface ContributionScoreParams {
  commentBaseScore: number;
  commentUpvoteWeight: number;
  commentDownvoteWeight: number;
  selfInteractionPenaltyFactor: number;
  projectOwnerUpvoteBonusMultiplier: number;
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

/**
 * Output record for contribution_score algorithm
 */
interface ContributionScoreResult {
  user_id: number;
  contribution_score: number;
}

interface ContributionScoreCommentDetail {
  comment_id: number;
  parent_id: number;
  is_reply: boolean;
  proposal_id: number;
  user_id: number;
  collection_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  base: number;
  related_project: boolean;
  same_author_reply: boolean;
  k: number;
  self_interaction_multiplier: number;
  tw: number | null;
  age_months: number | null;
  bucket_index: number | null;
  owner_upvoted: boolean;
  owner_bonus: number;
  comment_score: number;
  scored: boolean;
  skip_reason: 'invalid_created_at' | 'outside_engagement_window' | null;
}

interface ContributionScoreUserDetail {
  user_id: number;
  collection_id: string;
  contribution_score: number;
  comment_count: number;
  comments_scored_count: number;
  comments: ContributionScoreCommentDetail[];
}

interface ContributionScoreDetailsFile {
  snapshot_id: string;
  algorithm_key: string;
  algorithm_version: string;
  generated_at: string;
  deepfunding_db_key: string;
  params: {
    comment_base_score: number;
    comment_upvote_weight: number;
    comment_downvote_weight: number;
    self_interaction_penalty_factor: number;
    project_owner_upvote_bonus_multiplier: number;
    engagement_window_months: number;
    monthly_decay_rate_percent: number;
    decay_bucket_size_months: number;
  };
  users: ContributionScoreUserDetail[];
  comments: ContributionScoreCommentDetail[];
  stats: {
    total_comments_seen: number;
    total_comments_scored: number;
    invalid_created_at: number;
  };
}

/**
 * Parse algorithm parameters from input locations
 */
function parseParams(inputLocations: Array<{ key: string; value: unknown }>): ContributionScoreParams {
  const getNumericInput = (key: string, defaultValue: number = 0): number => {
    const entry = inputLocations.find((i) => i.key === key);
    if (!entry || entry.value === undefined || entry.value === null) {
      return defaultValue;
    }
    const numValue = Number(entry.value);
    if (Number.isNaN(numValue)) {
      throw new Error(`Input "${key}" has invalid numeric value: ${entry.value}`);
    }
    return numValue;
  };

  return {
    commentBaseScore: getNumericInput('comment_base_score'),
    commentUpvoteWeight: getNumericInput('comment_upvote_weight'),
    commentDownvoteWeight: getNumericInput('comment_downvote_weight'),
    selfInteractionPenaltyFactor: getNumericInput('self_interaction_penalty_factor'),
    projectOwnerUpvoteBonusMultiplier: getNumericInput('project_owner_upvote_bonus_multiplier'),
    engagementWindowMonths: getNumericInput('engagement_window_months'),
    monthlyDecayRatePercent: getNumericInput('monthly_decay_rate_percent'),
    decayBucketSizeMonths: getNumericInput('decay_bucket_size_months', 1),
  };
}

/**
 * Calculate the time decay weight (Tw) for a comment
 *
 * @param createdAt - Comment creation timestamp
 * @param now - Current timestamp
 * @param engagementWindowMonths - Window in months (comments older than this get 0)
 * @param monthlyDecayRatePercent - Decay rate per bucket (%)
 * @param decayBucketSizeMonths - Bucket size in months
 * @returns Time weight between 0 and 1
 */
function calculateTimeWeight(
  createdAt: Date,
  now: Date,
  engagementWindowMonths: number,
  monthlyDecayRatePercent: number,
  decayBucketSizeMonths: number,
): number {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44); // ~30.44 days per month

  // Outside engagement window → 0
  if (ageMonths >= engagementWindowMonths) {
    return 0;
  }

  // Calculate bucket index
  const bucketIndex = Math.floor(ageMonths / decayBucketSizeMonths);

  // Calculate time weight: Tw = max(0, 1 - bucketIndex * (decayRate/100))
  const tw = Math.max(0, 1 - bucketIndex * (monthlyDecayRatePercent / 100));

  return tw;
}

/**
 * Build a relation map: (userId, proposalId) → is_related
 *
 * A user is related to a proposal if they are:
 * - The proposer
 * - A team member
 */
function buildRelationMap(proposals: ProposalRecord[]): Map<string, boolean> {
  const relationMap = new Map<string, boolean>();

  for (const proposal of proposals) {
    // Proposer is related
    relationMap.set(`${proposal.proposerId}-${proposal.id}`, true);

    // Team members are related
    try {
      const teamMembers = JSON.parse(proposal.teamMembers) as number[];
      for (const memberId of teamMembers) {
        relationMap.set(`${memberId}-${proposal.id}`, true);
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return relationMap;
}

/**
 * Build a map of proposal ID → owner IDs (proposer + team members)
 */
function buildProjectOwnerMap(proposals: ProposalRecord[]): Map<number, Set<number>> {
  const ownerMap = new Map<number, Set<number>>();

  for (const proposal of proposals) {
    const owners = new Set<number>();
    owners.add(proposal.proposerId);

    try {
      const teamMembers = JSON.parse(proposal.teamMembers) as number[];
      for (const memberId of teamMembers) {
        owners.add(memberId);
      }
    } catch {
      // Ignore JSON parse errors
    }

    ownerMap.set(proposal.id, owners);
  }

  return ownerMap;
}

/**
 * Build a map of comment ID → author user ID
 */
function buildCommentAuthorMap(comments: CommentRecord[]): Map<number, number> {
  const authorMap = new Map<number, number>();
  for (const comment of comments) {
    authorMap.set(comment.commentId, comment.userId);
  }
  return authorMap;
}

/**
 * Compute contribution score for all users
 */
function computeContributionScore(
  comments: CommentRecord[],
  commentVotes: CommentVoteRecord[],
  proposals: ProposalRecord[],
  users: UserRecord[],
  params: ContributionScoreParams,
  now: Date,
): {
  csv: ContributionScoreResult[];
  details: Omit<
    ContributionScoreDetailsFile,
    'snapshot_id' | 'algorithm_key' | 'algorithm_version' | 'generated_at' | 'deepfunding_db_key'
  >;
} {
  // Build lookup maps
  const relationMap = buildRelationMap(proposals);
  const projectOwnerMap = buildProjectOwnerMap(proposals);
  const commentAuthorMap = buildCommentAuthorMap(comments);

  // Build comment ID → votes map (upvotes and downvotes counts, plus voter IDs)
  const commentVotesMap = new Map<number, { upvotes: number; downvotes: number; upvoterIds: Set<number> }>();
  for (const vote of commentVotes) {
    let entry = commentVotesMap.get(vote.commentId);
    if (!entry) {
      entry = {
        upvotes: 0,
        downvotes: 0,
        upvoterIds: new Set(),
      };
      commentVotesMap.set(vote.commentId, entry);
    }
    if (vote.voteType === 'upvote') {
      entry.upvotes++;
      entry.upvoterIds.add(vote.voterId);
    } else if (vote.voteType === 'downvote') {
      entry.downvotes++;
    }
  }

  // User ID → collection_id map
  const userCollectionMap = new Map<number, string>();
  for (const user of users) {
    userCollectionMap.set(user.id, user.collectionId);
  }

  // Aggregate scores by user
  const userScores = new Map<number, number>();
  const userCommentDetails = new Map<number, ContributionScoreCommentDetail[]>();
  let invalidCreatedAt = 0;
  let totalScored = 0;
  const allCommentDetails: ContributionScoreCommentDetail[] = [];

  for (const comment of comments) {
    const authorId = comment.userId;
    const proposalId = comment.proposalId;

    // Stage A: Reaction-adjusted base score
    const votes = commentVotesMap.get(comment.commentId) || {
      upvotes: 0,
      downvotes: 0,
      upvoterIds: new Set<number>(),
    };
    const base =
      params.commentBaseScore +
      votes.upvotes * params.commentUpvoteWeight -
      votes.downvotes * params.commentDownvoteWeight;

    // Stage B: Penalize self-related/self-reaction behavior
    let discountConditions = 0;

    // Condition 1: Related project discount
    const isRelated = relationMap.get(`${authorId}-${proposalId}`) === true;
    if (isRelated) {
      discountConditions++;
    }

    // Condition 2: Same-author reply discount
    const isReply = comment.isReply === true || comment.isReply === 1;
    let sameAuthorReply = false;
    if (isReply && comment.parentId > 0) {
      const parentAuthorId = commentAuthorMap.get(comment.parentId);
      if (parentAuthorId === authorId) {
        discountConditions++;
        sameAuthorReply = true;
      }
    }

    const discountMultiplier = params.selfInteractionPenaltyFactor ** discountConditions;

    // Stage C: Time decay (track invalid/out-of-window comments too)
    const createdAt = new Date(comment.createdAt);
    const createdAtValid = !Number.isNaN(createdAt.getTime());

    let tw: number | null = null;
    let ageMonths: number | null = null;
    let bucketIndex: number | null = null;

    if (createdAtValid) {
      const ageMs = now.getTime() - createdAt.getTime();
      ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44);
      bucketIndex = Math.floor(ageMonths / params.decayBucketSizeMonths);
      tw = calculateTimeWeight(
        createdAt,
        now,
        params.engagementWindowMonths,
        params.monthlyDecayRatePercent,
        params.decayBucketSizeMonths,
      );
    } else {
      invalidCreatedAt++;
      logger.warn({ commentId: comment.commentId }, 'Invalid createdAt date, marking comment as skipped');
    }

    // Stage D: Project-owner upvote bonus
    let ownerBonus = 1;
    let ownerUpvoted = false;
    const projectOwners = projectOwnerMap.get(proposalId);
    if (projectOwners) {
      // Check if any project owner upvoted this comment
      for (const upvoterId of votes.upvoterIds) {
        if (projectOwners.has(upvoterId)) {
          ownerBonus = params.projectOwnerUpvoteBonusMultiplier;
          ownerUpvoted = true;
          break;
        }
      }
    }

    // Final per-comment score
    const twValue = tw ?? 0;
    const shouldScore = twValue > 0;
    const commentScore = shouldScore ? ownerBonus * twValue * discountMultiplier * base : 0;
    if (shouldScore) {
      const currentScore = userScores.get(authorId) || 0;
      userScores.set(authorId, currentScore + commentScore);
      totalScored++;
    }

    const collectionId = userCollectionMap.get(authorId) ?? String(authorId);
    const detail: ContributionScoreCommentDetail = {
      comment_id: comment.commentId,
      parent_id: comment.parentId,
      is_reply: comment.isReply === true || comment.isReply === 1,
      proposal_id: proposalId,
      user_id: authorId,
      collection_id: collectionId,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
      upvotes: votes.upvotes,
      downvotes: votes.downvotes,
      base,
      related_project: isRelated,
      same_author_reply: sameAuthorReply,
      k: discountConditions,
      self_interaction_multiplier: discountMultiplier,
      tw,
      age_months: ageMonths,
      bucket_index: bucketIndex,
      owner_upvoted: ownerUpvoted,
      owner_bonus: ownerBonus,
      comment_score: commentScore,
      scored: shouldScore,
      skip_reason: createdAtValid ? (tw === 0 ? 'outside_engagement_window' : null) : 'invalid_created_at',
    };

    const existing = userCommentDetails.get(authorId) ?? [];
    existing.push(detail);
    userCommentDetails.set(authorId, existing);
    allCommentDetails.push(detail);
  }

  // Per-user details + score.
  // IMPORTANT: don't rely solely on the users table. Some snapshots may have comments/votes
  // populated while the users table is empty or incomplete.
  const userIds = new Set<number>();
  for (const u of users) userIds.add(u.id);
  for (const userId of userCommentDetails.keys()) userIds.add(userId);
  for (const userId of userScores.keys()) userIds.add(userId);

  const usersDetails: ContributionScoreUserDetail[] = Array.from(userIds)
    .sort((a, b) => a - b)
    .map((userId) => {
      const commentsForUser = userCommentDetails.get(userId) ?? [];
      const score = userScores.get(userId) ?? 0;

      commentsForUser.sort((a, b) => {
        const t = a.created_at.localeCompare(b.created_at);
        if (t !== 0) return t;
        return a.comment_id - b.comment_id;
      });
      const commentsScoredCount = commentsForUser.filter((c) => c.scored).length;

      return {
        user_id: userId,
        collection_id: userCollectionMap.get(userId) ?? String(userId),
        contribution_score: score,
        comment_count: commentsForUser.length,
        comments_scored_count: commentsScoredCount,
        comments: commentsForUser,
      };
    });

  // CSV output: include only users with at least one scored comment
  const csv: ContributionScoreResult[] = usersDetails
    .filter((u) => u.comments_scored_count > 0)
    .map((u) => ({
      user_id: u.user_id,
      contribution_score: u.contribution_score,
    }));

  allCommentDetails.sort((a, b) => {
    const aValid = a.skip_reason !== 'invalid_created_at';
    const bValid = b.skip_reason !== 'invalid_created_at';
    if (aValid !== bValid) return aValid ? -1 : 1;
    if (aValid && bValid) {
      const t = a.created_at.localeCompare(b.created_at);
      if (t !== 0) return t;
    }
    return a.comment_id - b.comment_id;
  });

  return {
    csv,
    details: {
      params: {
        comment_base_score: params.commentBaseScore,
        comment_upvote_weight: params.commentUpvoteWeight,
        comment_downvote_weight: params.commentDownvoteWeight,
        self_interaction_penalty_factor: params.selfInteractionPenaltyFactor,
        project_owner_upvote_bonus_multiplier: params.projectOwnerUpvoteBonusMultiplier,
        engagement_window_months: params.engagementWindowMonths,
        monthly_decay_rate_percent: params.monthlyDecayRatePercent,
        decay_bucket_size_months: params.decayBucketSizeMonths,
      },
      users: usersDetails,
      comments: allCommentDetails,
      stats: {
        total_comments_seen: comments.length,
        total_comments_scored: totalScored,
        invalid_created_at: invalidCreatedAt,
      },
    },
  };
}

/**
 * Activity implementation for the contribution_score algorithm.
 *
 * This algorithm computes contribution scores for users based on their comment activity.
 * It rewards community-endorsed contributions and penalizes self-serving behavior.
 *
 * @param payload - Workflow payload containing snapshot and input locations
 * @returns Output locations for computed results
 */
export async function contribution_score(payload: WorkerAlgorithmPayload): Promise<WorkerAlgorithmResult> {
  const { snapshotId, algorithmKey, algorithmVersion, inputLocations } = payload;

  logger.info(
    {
      snapshotId,
      algorithmKey,
      algorithmVersion,
    },
    'Starting contribution_score algorithm',
  );

  try {
    // Get storage instance from global (initialized in worker/main.ts)
    const storage = global.storage;
    if (!storage) {
      throw new Error('Storage instance not initialized. Ensure worker is properly started.');
    }

    // 1. Parse algorithm parameters
    const params = parseParams(inputLocations);

    logger.info(
      {
        commentBaseScore: params.commentBaseScore,
        commentUpvoteWeight: params.commentUpvoteWeight,
        commentDownvoteWeight: params.commentDownvoteWeight,
        selfInteractionPenaltyFactor: params.selfInteractionPenaltyFactor,
        projectOwnerUpvoteBonusMultiplier: params.projectOwnerUpvoteBonusMultiplier,
        engagementWindowMonths: params.engagementWindowMonths,
        monthlyDecayRatePercent: params.monthlyDecayRatePercent,
        decayBucketSizeMonths: params.decayBucketSizeMonths,
      },
      'Parsed algorithm parameters',
    );

    // 2. Resolve snapshot-scoped DeepFunding Portal DB key (generated by pre-step sync)
    const deepfundingDbKey = getInputLocation(inputLocations, 'deepfunding_db_key');

    // 3. Download DB and write to a temp file (better-sqlite3 needs a file path)
    const dbBytes = await storage.getObject(deepfundingDbKey);
    const tempDir = await mkdtemp(join(tmpdir(), `reputo-deepfundingdb-${snapshotId}-`));
    const localDbPath = join(tempDir, 'deepfunding.db');
    await writeFile(localDbPath, dbBytes);

    // 4. Initialize DeepFunding Portal database and load data
    const { initializeDb, closeDb, commentsRepo, commentVotesRepo, proposalsRepo, usersRepo } = await import(
      '@reputo/deepfunding-portal-api'
    );

    initializeDb({ path: localDbPath });

    try {
      // 5. Load all required data from the database
      const comments = commentsRepo.findAll() as CommentRecord[];
      const commentVotes = commentVotesRepo.findAll() as CommentVoteRecord[];
      const proposals = proposalsRepo.findAll() as ProposalRecord[];
      const users = usersRepo.findAll() as UserRecord[];

      logger.info(
        {
          commentCount: comments.length,
          commentVoteCount: commentVotes.length,
          proposalCount: proposals.length,
          userCount: users.length,
        },
        'Loaded data from DeepFunding Portal database',
      );

      // 6. Compute contribution scores
      const now = new Date();
      const computed = computeContributionScore(comments, commentVotes, proposals, users, params, now);

      logger.info(
        {
          resultCount: computed.csv.length,
        },
        'Computed contribution scores',
      );

      // 7. Serialize results to CSV
      const outputCsv = stringify(computed.csv, {
        header: true,
        columns: ['user_id', 'contribution_score'],
      });

      // 8. Upload output to storage
      const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`);
      await storage.putObject(outputKey, outputCsv, 'text/csv');

      // 8b. Upload JSON details
      const detailsKey = generateKey('snapshot', snapshotId, 'contribution_score_details.json');
      const details: ContributionScoreDetailsFile = {
        snapshot_id: snapshotId,
        algorithm_key: algorithmKey,
        algorithm_version: algorithmVersion,
        generated_at: new Date().toISOString(),
        deepfunding_db_key: deepfundingDbKey,
        ...computed.details,
      };
      await storage.putObject(detailsKey, JSON.stringify(details, null, 2), 'application/json');

      logger.info({ outputKey }, 'Uploaded contribution score results');

      // 9. Return output locations
      return {
        outputs: {
          contribution_score: outputKey,
          contribution_score_details: detailsKey,
        },
      };
    } finally {
      // Always close the database connection
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
      'Failed to compute contribution_score',
    );
    throw error;
  }
}
