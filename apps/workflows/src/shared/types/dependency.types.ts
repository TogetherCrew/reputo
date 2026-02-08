/**
 * Types for dependency resolution in workflows.
 */

/**
 * Known dependency keys that can be resolved.
 */
export type DependencyKey = 'deepfunding-portal-api';

/**
 * Input for resolving a single dependency.
 */
export interface ResolveDependencyInput {
  /** The dependency key to resolve */
  dependencyKey: DependencyKey;
  /** The snapshot ID for context */
  snapshotId: string;
}

/**
 * Registry entry for a dependency resolver.
 */
export interface DependencyResolverEntry {
  /** Function to resolve the dependency (uploads data to predictable S3 path) */
  resolve: (snapshotId: string) => Promise<void>;
}
