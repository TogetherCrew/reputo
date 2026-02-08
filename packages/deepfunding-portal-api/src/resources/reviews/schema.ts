import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Reviews table
 */
export const reviews = sqliteTable(
  'reviews',
  {
    reviewId: integer('review_id').primaryKey({ autoIncrement: true }),
    proposalId: integer('proposal_id'),
    reviewerId: integer('reviewer_id'),
    reviewType: text('review_type').notNull(),
    overallRating: text('overall_rating').notNull(),
    feasibilityRating: text('feasibility_rating').notNull(),
    viabilityRating: text('viability_rating').notNull(),
    desirabilityRating: text('desirability_rating').notNull(),
    usefulnessRating: text('usefulness_rating').notNull(),
    createdAt: text('created_at'),
    rawJson: text('raw_json').notNull(),
  },
  (table) => [
    index('idx_reviews_proposal_id').on(table.proposalId),
    index('idx_reviews_reviewer_id').on(table.reviewerId),
  ],
);
