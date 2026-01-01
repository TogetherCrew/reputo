import * as wf from '@temporalio/workflow';
import type { WorkerAlgorithmPayload, WorkerAlgorithmResult } from '../types/algorithm.js';

// Payload and result shape expected by the parent workflows app
interface WorkflowAlgorithmPayload {
  snapshotId: string;
  algorithmKey: string;
  algorithmVersion: string;
  inputLocations: Record<string, unknown>;
}

interface WorkflowAlgorithmResult {
  outputs: Record<string, unknown>;
}

type AlgorithmActivities = {
  voting_engagement: (payload: WorkerAlgorithmPayload) => Promise<WorkerAlgorithmResult>;
  contribution_score: (payload: WorkerAlgorithmPayload) => Promise<WorkerAlgorithmResult>;
  proposal_engagement: (payload: WorkerAlgorithmPayload) => Promise<WorkerAlgorithmResult>;
};

type DeepFundingActivities = {
  deepfunding_sync: (input: { snapshotId: string }) => Promise<{
    outputs: {
      deepfunding_db_key: string;
      deepfunding_manifest_key: string;
    };
  }>;
};

// Proxy activities that run on the same task queue as this child workflow
const { voting_engagement, contribution_score, proposal_engagement } = wf.proxyActivities<AlgorithmActivities>({
  // Keep generous timeout for algorithm execution; parent also enforces workflow timeout
  startToCloseTimeout: '10 minutes',
});

const { deepfunding_sync } = wf.proxyActivities<DeepFundingActivities>({
  // Portal sync can be slower than algorithm compute
  startToCloseTimeout: '30 minutes',
});

/**
 * ExecuteAlgorithmWorkflow - Runs an algorithm activity on the algorithm worker queue.
 *
 * This workflow is invoked as a child workflow from the orchestrator (apps/workflows),
 * enabling activity execution on a separate task queue managed by this worker.
 */
export async function ExecuteAlgorithmWorkflow(payload: WorkflowAlgorithmPayload): Promise<WorkflowAlgorithmResult> {
  wf.log.info('ExecuteAlgorithmWorkflow received payload', {
    snapshotId: payload.snapshotId,
    algorithmKey: payload.algorithmKey,
    algorithmVersion: payload.algorithmVersion,
    inputKeys: Object.keys(payload.inputLocations ?? {}),
  });

  // Convert inputLocations map (from orchestrator) into array (expected by activities)
  const inputLocationsArray: WorkerAlgorithmPayload['inputLocations'] = Object.entries(
    payload.inputLocations ?? {},
  ).map(([key, value]) => ({
    key,
    value,
  }));

  const activityPayload: WorkerAlgorithmPayload = {
    snapshotId: payload.snapshotId,
    algorithmKey: payload.algorithmKey,
    algorithmVersion: payload.algorithmVersion,
    inputLocations: inputLocationsArray,
  };

  // Pre-step: ensure snapshot-scoped DeepFunding DB exists for portal-backed algorithms
  if (payload.algorithmKey === 'contribution_score' || payload.algorithmKey === 'proposal_engagement') {
    const syncResult = await deepfunding_sync({ snapshotId: payload.snapshotId });
    activityPayload.inputLocations.push({
      key: 'deepfunding_db_key',
      value: syncResult.outputs.deepfunding_db_key,
    });
  }

  switch (payload.algorithmKey) {
    case 'voting_engagement': {
      const result = await voting_engagement(activityPayload);
      wf.log.info('Algorithm activity completed', {
        algorithmKey: payload.algorithmKey,
        outputKeys: Object.keys(result.outputs ?? {}),
      });
      return result;
    }
    case 'contribution_score': {
      const result = await contribution_score(activityPayload);
      wf.log.info('Algorithm activity completed', {
        algorithmKey: payload.algorithmKey,
        outputKeys: Object.keys(result.outputs ?? {}),
      });
      return result;
    }
    case 'proposal_engagement': {
      const result = await proposal_engagement(activityPayload);
      wf.log.info('Algorithm activity completed', {
        algorithmKey: payload.algorithmKey,
        outputKeys: Object.keys(result.outputs ?? {}),
      });
      return result;
    }
    default: {
      const message = `Unsupported algorithmKey "${payload.algorithmKey}"`;
      wf.log.error(message);
      throw new Error(message);
    }
  }
}
