/**
 * Schema version for database migrations
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * SQL statements to bootstrap the database schema
 */
export const BOOTSTRAP_SQL: string[] = [
  `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      pool_ids TEXT NOT NULL,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS pools (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      max_funding_amount INTEGER NOT NULL,
      description TEXT,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY,
      round_id INTEGER NOT NULL,
      pool_id INTEGER NOT NULL,
      proposer_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      link TEXT NOT NULL,
      feature_image TEXT NOT NULL,
      requested_amount TEXT NOT NULL,
      awarded_amount TEXT NOT NULL,
      is_awarded INTEGER NOT NULL,
      is_completed INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      team_members TEXT NOT NULL,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      collection_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      email TEXT NOT NULL,
      total_proposals INTEGER NOT NULL,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY,
      proposal_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      development_description TEXT NOT NULL,
      budget INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS reviews (
      review_id INTEGER PRIMARY KEY,
      proposal_id INTEGER,
      reviewer_id INTEGER,
      review_type TEXT NOT NULL,
      overall_rating TEXT NOT NULL,
      feasibility_rating TEXT NOT NULL,
      viability_rating TEXT NOT NULL,
      desirability_rating TEXT NOT NULL,
      usefulness_rating TEXT NOT NULL,
      created_at TEXT,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS comments (
      comment_id INTEGER PRIMARY KEY,
      parent_id INTEGER NOT NULL,
      is_reply INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      proposal_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      comment_votes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      raw_json TEXT NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS comment_votes (
      voter_id INTEGER NOT NULL,
      comment_id INTEGER NOT NULL,
      vote_type TEXT NOT NULL,
      created_at TEXT,
      raw_json TEXT NOT NULL,
      PRIMARY KEY (voter_id, comment_id)
   );`,

  `CREATE INDEX IF NOT EXISTS idx_reviews_proposal_id ON reviews(proposal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_comments_proposal_id ON comments(proposal_id);`,
  `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON comment_votes(comment_id);`,
  `CREATE INDEX IF NOT EXISTS idx_proposals_round_id ON proposals(round_id);`,
  `CREATE INDEX IF NOT EXISTS idx_proposals_pool_id ON proposals(pool_id);`,
];
