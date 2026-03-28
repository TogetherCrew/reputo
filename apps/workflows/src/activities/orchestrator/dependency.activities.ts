import { Context } from '@temporalio/activity';

import type {
  DependencyResolverActivities,
  OrchestratorDependencyResolverContext,
  ResolveDependencyInput,
} from '../../shared/types/index.js';
import { createDeepfundingSyncActivity } from './deepfunding-portal-api.activities.js';

export function createOrchestratorDependencyResolverActivities(
  ctx: OrchestratorDependencyResolverContext,
): DependencyResolverActivities {
  const deepfundingSync = createDeepfundingSyncActivity({
    storage: ctx.storage,
    storageConfig: ctx.storageConfig,
  });

  return {
    async resolveDependency(input: ResolveDependencyInput): Promise<void> {
      const logger = Context.current().log;
      const { dependencyKey, snapshotId } = input;

      logger.info('Resolving dependency', {
        dependencyKey,
        snapshotId,
      });

      switch (dependencyKey) {
        case 'deepfunding-portal-api':
          await deepfundingSync({ snapshotId });
          break;
      }

      logger.info('Dependency resolved successfully', {
        dependencyKey,
        snapshotId: snapshotId,
      });
    },
  };
}
