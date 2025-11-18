/**
 * Activities for Temporal workflows.
 *
 * Exports activity factories and type definitions.
 */

import type { Model } from 'mongoose';
import type { Snapshot } from '@reputo/database';
import {
  createAlgorithmLibraryActivities,
  type AlgorithmLibraryActivities,
} from './algorithm-library.activities.js';
import {
  createDatabaseActivities,
  type DatabaseActivities,
} from './database.activities.js';

/**
 * Combined activities type for all workflow activities.
 */
export type WorkflowsActivities = DatabaseActivities & AlgorithmLibraryActivities;

/**
 * Creates all workflow activities with injected dependencies.
 *
 * @param snapshotModel - Mongoose model for Snapshot documents
 * @returns Combined activities object
 */
export function createWorkflowActivities(
  snapshotModel: Model<Snapshot>,
): WorkflowsActivities {
  return {
    ...createDatabaseActivities(snapshotModel),
    ...createAlgorithmLibraryActivities(),
  };
}

// Export activity types and factories
export * from './database.activities.js';
export * from './algorithm-library.activities.js';

