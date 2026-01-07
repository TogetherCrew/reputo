import { Context } from '@temporalio/activity';

import type {
  DependencyResolverActivities,
  DependencyResolverContext,
  ResolveDependencyInput,
} from '../../shared/types/index.js';
import { createDeepfundingSyncActivity } from './deepfunding-portal-api.activities.js';

export function createDependencyResolverActivities(ctx: DependencyResolverContext): DependencyResolverActivities {
  const deepfundingSync = createDeepfundingSyncActivity(ctx);

  return {
    async resolveDependency(input: ResolveDependencyInput): Promise<void> {
      const logger = Context.current().log;
      const { dependencyKey, snapshotId } = input;

      logger.info('Resolving dependency', { dependencyKey, snapshotId });

      switch (dependencyKey) {
        case 'deepfunding-portal-api':
          await deepfundingSync({ snapshotId });
          break;
        default:
          throw new Error(`Unknown dependency key: ${dependencyKey satisfies never}`);
      }

      logger.info('Dependency resolved successfully', { dependencyKey, snapshotId });
    },
  };
}
