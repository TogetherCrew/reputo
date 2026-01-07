import type { Snapshot } from '@reputo/database';
import type { Storage } from '@reputo/storage';

import type { AlgorithmResult, StorageConfig } from './algorithm.types.js';
import type { ResolveDependencyInput } from './dependency.types.js';

export interface GetSnapshotInput {
  snapshotId: string;
}

export interface GetSnapshotOutput {
  snapshot: Snapshot;
}

export interface UpdateSnapshotInput {
  snapshotId: string;
  status?: Snapshot['status'];
  temporal?: Snapshot['temporal'];
  outputs?: Snapshot['outputs'];
  error?: {
    message: string;
    [key: string]: unknown;
  };
}

export interface DbActivities {
  getSnapshot: (input: GetSnapshotInput) => Promise<GetSnapshotOutput>;
  updateSnapshot: (input: UpdateSnapshotInput) => Promise<void>;
}

export interface GetAlgorithmDefinitionInput {
  key: string;
  version?: string;
}

export interface GetAlgorithmDefinitionOutput {
  definition: {
    key: string;
    name: string;
    category: string;
    summary: string;
    description: string;
    version: string;
    inputs: unknown[];
    outputs: unknown[];
    runtime: string;
    dependencies?: { key: string }[];
  };
}

export interface AlgorithmLibraryActivities {
  getAlgorithmDefinition: (input: GetAlgorithmDefinitionInput) => Promise<GetAlgorithmDefinitionOutput>;
}

export interface DependencyResolverContext {
  storage: Storage;
  storageConfig: StorageConfig;
}

export interface DependencyResolverActivities {
  resolveDependency: (input: ResolveDependencyInput) => Promise<void>;
}

export interface DeepfundingSyncContext {
  storage: Storage;
  storageConfig: StorageConfig;
}

export type PaginatedResponse = {
  // biome-ignore lint/suspicious/noExplicitAny: External API response data
  data: any[];
  pagination?: {
    current_page?: string | number;
  };
};

export interface DeepFundingSyncInput {
  snapshotId: string;
}

export interface DeepFundingSyncOutput {
  deepfunding_db_key: string;
  deepfunding_manifest_key: string;
}

export type AlgorithmComputeFunction = (snapshot: Snapshot, storage: Storage) => Promise<AlgorithmResult>;

export type TypescriptAlgorithmDispatcherActivities = {
  runTypescriptAlgorithm: (snapshot: Snapshot) => Promise<AlgorithmResult>;
};
