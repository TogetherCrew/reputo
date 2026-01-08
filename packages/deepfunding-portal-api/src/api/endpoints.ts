/**
 * API endpoint path builders for the DeepFunding Portal API
 */
export const endpoints = {
  /** Get all funding rounds */
  rounds: () => '/rounds',

  /** Get all funding pools */
  pools: () => '/pools',

  /** Get proposals for a specific round */
  proposals: (roundId: number) => `/rounds/${roundId}/proposals`,

  /** Get all users */
  users: () => '/users',

  /** Get all milestones */
  milestones: () => '/milestones',

  /** Get all reviews */
  reviews: () => '/reviews',

  /** Get all comments */
  comments: () => '/comments',

  /** Get all comment votes */
  commentVotes: () => '/comment_votes',
} as const;

export type EndpointKey = keyof typeof endpoints;
