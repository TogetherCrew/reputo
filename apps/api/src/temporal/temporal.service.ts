import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Snapshot } from '@reputo/database';
import { Client, Connection } from '@temporalio/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

/**
 * Service for interacting with Temporal workflows.
 *
 * Manages Temporal client connection and provides methods to start workflows.
 */
@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection | null = null;
  private client: Client | null = null;

  constructor(
    @InjectPinoLogger(TemporalService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize Temporal connection and client on module initialization.
   */
  async onModuleInit(): Promise<void> {
    try {
      const address = this.configService.get<string>('temporal.address');
      const namespace = this.configService.get<string>('temporal.namespace') || 'default';

      if (!address) {
        this.logger.warn('TEMPORAL_ADDRESS not configured, Temporal workflows will not be available');
        return;
      }

      this.logger.info(`Connecting to Temporal at ${address} (namespace: ${namespace})`);

      this.connection = await Connection.connect({
        address,
      });

      this.client = new Client({
        connection: this.connection,
        namespace,
      });

      this.logger.info('Temporal client connected successfully');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to connect to Temporal: ${err.message}`, err.stack);
      // Don't throw - allow app to start even if Temporal is unavailable
    }
  }

  /**
   * Close Temporal connection on module destruction.
   */
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
        this.logger.info('Temporal connection closed');
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error closing Temporal connection: ${err.message}`, err.stack);
    }
  }

  /**
   * Starts the OrchestratorWorkflow for a given snapshot.
   *
   * @param snapshotId - MongoDB ObjectId of the snapshot to execute
   * @returns Promise that resolves when workflow is started
   * @throws Error if Temporal client is not available or workflow start fails
   */
  async startRunSnapshotWorkflow(snapshotId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Temporal client is not available. Check TEMPORAL_ADDRESS configuration.');
    }

    const orchestratorTaskQueue =
      this.configService.get<string>('temporal.orchestratorTaskQueue') ||
      this.configService.get<string>('temporal.taskQueue') ||
      'workflows';
    const algorithmTypescriptTaskQueue =
      this.configService.get<string>('temporal.algorithmTypescriptTaskQueue') || 'algorithm-typescript-worker';
    const algorithmPythonTaskQueue =
      this.configService.get<string>('temporal.algorithmPythonTaskQueue') || 'algorithm-python-worker';
    const workflowId = `snapshot-${snapshotId}`;

    try {
      this.logger.info(`Starting OrchestratorWorkflow for snapshot ${snapshotId}`, {
        workflowId,
        taskQueue: orchestratorTaskQueue,
        algorithmTypescriptTaskQueue,
        algorithmPythonTaskQueue,
        snapshotId,
      });

      await this.client.workflow.start('OrchestratorWorkflow', {
        taskQueue: orchestratorTaskQueue,
        workflowId,
        args: [
          {
            snapshotId,
            taskQueues: {
              typescript: algorithmTypescriptTaskQueue,
              python: algorithmPythonTaskQueue,
            },
          },
        ],
      });

      this.logger.info(`OrchestratorWorkflow started successfully for snapshot ${snapshotId}`, {
        workflowId,
        snapshotId,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to start OrchestratorWorkflow for snapshot ${snapshotId}: ${err.message}`, err.stack, {
        workflowId,
        taskQueue: orchestratorTaskQueue,
        snapshotId,
      });
      throw error;
    }
  }

  /**
   * Fire-and-forget start for snapshot workflow with error logging only.
   */
  async startSnapshotWorkflow(snapshotId: string): Promise<void> {
    try {
      await this.startRunSnapshotWorkflow(snapshotId);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to start workflow for snapshot ${snapshotId}: ${err.message}`, err.stack, {
        snapshotId,
      });
    }
  }

  /**
   * Cancels a running Temporal workflow by its workflow ID.
   *
   * @param workflowId - The Temporal workflow ID to cancel
   * @throws Error if Temporal client is not available
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Temporal client is not available. Check TEMPORAL_ADDRESS configuration.');
    }

    try {
      this.logger.info(`Cancelling workflow ${workflowId}`);

      const handle = this.client.workflow.getHandle(workflowId);
      await handle.cancel();

      this.logger.info(`Workflow ${workflowId} cancelled successfully`);
    } catch (error) {
      const err = error as Error;
      // WorkflowNotFoundError means workflow already completed or doesn't exist
      if (err.name === 'WorkflowNotFoundError') {
        this.logger.warn(`Workflow ${workflowId} not found, may have already completed`);
        return;
      }
      this.logger.error(`Failed to cancel workflow ${workflowId}: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Safe cancellation wrapper that logs errors but does not throw.
   */
  async cancelSnapshotWorkflow(workflowId: string): Promise<void> {
    try {
      await this.cancelWorkflow(workflowId);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to cancel workflow ${workflowId}: ${err.message}`, err.stack);
    }
  }

  /**
   * Cancels workflows for all running snapshots.
   */
  async cancelSnapshotWorkflows(snapshots: Snapshot[]): Promise<void> {
    const runningSnapshots = snapshots.filter(
      (snapshot) => snapshot.status === 'running' && snapshot.temporal?.workflowId,
    );

    for (const snapshot of runningSnapshots) {
      const workflowId = snapshot.temporal?.workflowId;
      if (workflowId) {
        await this.cancelSnapshotWorkflow(workflowId);
      }
    }
  }
}
