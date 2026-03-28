import { Context } from '@temporalio/activity';

import type {
  DependencyResolverActivities,
  OnchainDataSyncContext,
  OrchestratorDependencyResolverContext,
  ResolveDependencyInput,
} from '../../shared/types/index.js';
import { createDeepfundingSyncActivity } from './deepfunding-portal-api.activities.js';
import { createOnchainDataSyncActivity } from './onchain-data.activities.js';

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

export function createOnchainDataDependencyResolverActivities(
  ctx: OnchainDataSyncContext,
): DependencyResolverActivities {
  const onchainDataSync = createOnchainDataSyncActivity(ctx);

  return {
    async resolveDependency(input: ResolveDependencyInput): Promise<void> {
      const logger = Context.current().log;
      const { dependencyKey, snapshotId, syncTargets } = input;

      if (dependencyKey !== 'onchain-data') {
        throw new Error(
          `onchain-data worker received unexpected dependency "${dependencyKey}"; only "onchain-data" is supported`,
        );
      }

      logger.info('Resolving dependency', {
        dependencyKey,
        snapshotId,
        syncTargetCount: syncTargets?.length ?? 0,
      });

      await onchainDataSync(syncTargets ?? []);

      logger.info('Dependency resolved successfully', {
        dependencyKey,
        snapshotId: snapshotId,
      });
    },
  };
}
