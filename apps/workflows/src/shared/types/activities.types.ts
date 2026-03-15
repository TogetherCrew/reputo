import type { Snapshot as SnapshotBase } from '@reputo/database';
import type { Storage } from '@reputo/storage';

import type { AlgorithmResult, StorageConfig } from './algorithm.types.js';
import type { ResolveDependencyInput } from './dependency.types.js';

/** Serialized snapshot (activity boundary): base shape with _id as string. */
export type Snapshot = Omit<SnapshotBase, '_id'> & { _id: string };

export interface GetSnapshotInput {
  snapshotId: string;
}

export interface GetSnapshotOutput {
  snapshot: Snapshot;
}

export interface UpdateSnapshotInput {
  snapshotId: string;
  status?: SnapshotBase['status'];
  temporal?: SnapshotBase['temporal'];
  outputs?: SnapshotBase['outputs'];
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
  AlgorithmDefinition: {
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

export interface OnchainDataSyncContext {
  dbPath: string;
  alchemyApiKey: string;
}

export interface DependencyResolverContext {
  storage: Storage;
  storageConfig: StorageConfig;
  onchainData: OnchainDataSyncContext;
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
