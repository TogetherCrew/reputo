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
  CommentRecord,
  CommentVoteRecord,
  ContributionScoreCommentDetail,
  ContributionScoreDetailsFile,
  ContributionScoreParams,
  ContributionScoreProposalRecord,
  ContributionScoreUserDetail,
  ContributionScoreUserRecord,
} from '../../../../shared/types/index.js';
import { parseContributionScoreParams } from '../../../../shared/types/index.js';

/**
 * Calculate time weight based on comment age and decay parameters.
 */
function calculateTimeWeight(
  createdAt: Date,
  now: Date,
  engagementWindowMonths: number,
  monthlyDecayRatePercent: number,
  decayBucketSizeMonths: number,
): number {
  const ageMs = now.getTime() - createdAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44);

  if (ageMonths >= engagementWindowMonths) {
    return 0;
  }

  const bucketIndex = Math.floor(ageMonths / decayBucketSizeMonths);
  return Math.max(0, 1 - bucketIndex * (monthlyDecayRatePercent / 100));
}

/**
 * Build a map of user-proposal relationships (proposer or team member).
 */
function buildRelationMap(proposals: ContributionScoreProposalRecord[]): Map<string, boolean> {
  const relationMap = new Map<string, boolean>();

  for (const proposal of proposals) {
    relationMap.set(`${proposal.proposerId}-${proposal.id}`, true);

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

function buildProjectOwnerMap(proposals: ContributionScoreProposalRecord[]): Map<number, Set<number>> {
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
 * Build a map of comment IDs to their author user IDs.
 */
function buildCommentAuthorMap(comments: CommentRecord[]): Map<number, number> {
  const authorMap = new Map<number, number>();
  for (const comment of comments) {
    authorMap.set(comment.commentId, comment.userId);
  }
  return authorMap;
}

/**
 * Core computation logic for contribution scores.
 */
function computeScores(
  comments: CommentRecord[],
  commentVotes: CommentVoteRecord[],
  proposals: ContributionScoreProposalRecord[],
  users: ContributionScoreUserRecord[],
  params: ContributionScoreParams,
  now: Date,
  logger: { warn: (msg: string, ctx?: Record<string, unknown>) => void },
) {
  const relationMap = buildRelationMap(proposals);
  const projectOwnerMap = buildProjectOwnerMap(proposals);
  const commentAuthorMap = buildCommentAuthorMap(comments);

  // Build vote aggregation map
  const commentVotesMap = new Map<number, { upvotes: number; downvotes: number; upvoterIds: Set<number> }>();
  for (const vote of commentVotes) {
    let entry = commentVotesMap.get(vote.commentId);
    if (!entry) {
      entry = { upvotes: 0, downvotes: 0, upvoterIds: new Set() };
      commentVotesMap.set(vote.commentId, entry);
    }
    if (vote.voteType === 'upvote') {
      entry.upvotes++;
      entry.upvoterIds.add(vote.voterId);
    } else if (vote.voteType === 'downvote') {
      entry.downvotes++;
    }
  }

  // Build user collection ID map
  const userCollectionMap = new Map<number, string>();
  for (const user of users) {
    userCollectionMap.set(user.id, user.collectionId);
  }

  const userScores = new Map<number, number>();
  const userCommentDetails = new Map<number, ContributionScoreCommentDetail[]>();
  let invalidCreatedAt = 0;
  let totalScored = 0;
  const allCommentDetails: ContributionScoreCommentDetail[] = [];

  for (const comment of comments) {
    const authorId = comment.userId;
    const proposalId = comment.proposalId;

    const votes = commentVotesMap.get(comment.commentId) || {
      upvotes: 0,
      downvotes: 0,
      upvoterIds: new Set<number>(),
    };
    const base =
      params.commentBaseScore +
      votes.upvotes * params.commentUpvoteWeight -
      votes.downvotes * params.commentDownvoteWeight;

    // Count self-interaction discount conditions
    let discountConditions = 0;
    const isRelated = relationMap.get(`${authorId}-${proposalId}`) === true;
    if (isRelated) {
      discountConditions++;
    }

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
      logger.warn('Invalid createdAt date, marking comment as skipped', {
        commentId: comment.commentId,
      });
    }

    // Check for project owner upvote bonus
    let ownerBonus = 1;
    let ownerUpvoted = false;
    const projectOwners = projectOwnerMap.get(proposalId);
    if (projectOwners) {
      for (const upvoterId of votes.upvoterIds) {
        if (projectOwners.has(upvoterId)) {
          ownerBonus = params.projectOwnerUpvoteBonusMultiplier;
          ownerUpvoted = true;
          break;
        }
      }
    }

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

  // Collect all user IDs
  const userIds = new Set<number>();
  for (const u of users) userIds.add(u.id);
  for (const userId of userCommentDetails.keys()) userIds.add(userId);
  for (const userId of userScores.keys()) userIds.add(userId);

  // Build user details
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

  // Build CSV output (only users with scored comments)
  const csv = usersDetails
    .filter((u) => u.comments_scored_count > 0)
    .map((u) => ({
      user_id: u.user_id,
      contribution_score: u.contribution_score,
    }));

  // Sort all comment details
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
 * Computes contribution scores for users.
 *
 * @param snapshot - Snapshot document with algorithm configuration
 * @param storage - Storage client for file operations
 * @returns Algorithm result with output file locations
 */
export async function computeContributionScore(snapshot: Snapshot, storage: Storage): Promise<AlgorithmResult> {
  const snapshotId = String((snapshot as unknown as { _id: string })._id);
  const { key: algorithmKey, version: algorithmVersion, inputs } = snapshot.algorithmPresetFrozen;
  const logger = Context.current().log;

  logger.info('Starting contribution_score algorithm', {
    snapshotId,
    algorithmKey,
    algorithmVersion,
  });

  const { bucket } = config.storage;

  // Parse parameters from inputs
  const params = parseContributionScoreParams(inputs);

  logger.info('Parsed algorithm parameters', {
    commentBaseScore: params.commentBaseScore,
    commentUpvoteWeight: params.commentUpvoteWeight,
    commentDownvoteWeight: params.commentDownvoteWeight,
    selfInteractionPenaltyFactor: params.selfInteractionPenaltyFactor,
    projectOwnerUpvoteBonusMultiplier: params.projectOwnerUpvoteBonusMultiplier,
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

  // Load data from SQLite database
  const { initializeDb, closeDb, commentsRepo, commentVotesRepo, proposalsRepo, usersRepo } = await import(
    '@reputo/deepfunding-portal-api'
  );

  initializeDb({ path: localDbPath });

  try {
    const comments = commentsRepo.findAll() as CommentRecord[];
    const commentVotes = commentVotesRepo.findAll() as CommentVoteRecord[];
    const proposals = proposalsRepo.findAll() as ContributionScoreProposalRecord[];
    const users = usersRepo.findAll() as ContributionScoreUserRecord[];

    logger.info('Loaded data from DeepFunding Portal database', {
      commentCount: comments.length,
      commentVoteCount: commentVotes.length,
      proposalCount: proposals.length,
      userCount: users.length,
    });

    // Execute computation
    const now = new Date();
    const computed = computeScores(comments, commentVotes, proposals, users, params, now, {
      warn: (msg, ctx) => logger.warn(msg, ctx ?? {}),
    });

    logger.info('Computed contribution scores', {
      resultCount: computed.csv.length,
    });

    // Generate and upload CSV output
    const outputCsv = stringify(computed.csv, {
      header: true,
      columns: ['user_id', 'contribution_score'],
    });

    const outputKey = generateKey('snapshot', snapshotId, `${algorithmKey}.csv`);
    await storage.putObject({
      bucket,
      key: outputKey,
      body: outputCsv,
      contentType: 'text/csv',
    });

    // Generate and upload details JSON
    const detailsKey = generateKey('snapshot', snapshotId, 'contribution_score_details.json');
    const details: ContributionScoreDetailsFile = {
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

    logger.info('Uploaded contribution score results', { outputKey });

    return {
      outputs: {
        contribution_score: outputKey,
        contribution_score_details: detailsKey,
      },
    };
  } finally {
    closeDb();
    await rm(tempDir, { recursive: true, force: true });
  }
}
