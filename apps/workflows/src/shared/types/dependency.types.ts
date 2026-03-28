/**
 * Types for dependency resolution in workflows.
 */

/**
 * Known dependency keys that can be resolved.
 */
export type DependencyKey = 'deepfunding-portal-api' | 'onchain-data';

/**
 * A chain+identifier pair that the onchain worker should sync.
 */
export interface SyncTarget {
  chain: string;
  identifier: string;
}

/**
 * Input for resolving a single dependency.
 */
export interface ResolveDependencyInput {
  /** The dependency key to resolve */
  dependencyKey: DependencyKey;
  /** The snapshot ID for context */
  snapshotId: string;
  /** For onchain-data: which chain+identifier pairs to sync */
  syncTargets?: SyncTarget[];
}

/**
 * Registry entry for a dependency resolver.
 */
export interface DependencyResolverEntry {
  /** Function to resolve the dependency (uploads data to predictable S3 path) */
  resolve: (snapshotId: string) => Promise<void>;
}
