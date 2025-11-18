import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Connection } from '@temporalio/client';

/**
 * Service for interacting with Temporal workflows.
 *
 * Manages Temporal client connection and provides methods to start workflows.
 */
@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalService.name);
  private connection: Connection | null = null;
  private client: Client | null = null;

  constructor(private readonly configService: ConfigService) {}

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

      this.logger.log(`Connecting to Temporal at ${address} (namespace: ${namespace})`);

      this.connection = await Connection.connect({
        address,
      });

      this.client = new Client({
        connection: this.connection,
        namespace,
      });

      this.logger.log('Temporal client connected successfully');
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
        this.logger.log('Temporal connection closed');
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error closing Temporal connection: ${err.message}`, err.stack);
    }
  }

  /**
   * Starts the RunSnapshotWorkflow for a given snapshot.
   *
   * @param snapshotId - MongoDB ObjectId of the snapshot to execute
   * @returns Promise that resolves when workflow is started
   * @throws Error if Temporal client is not available or workflow start fails
   */
  async startRunSnapshotWorkflow(snapshotId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Temporal client is not available. Check TEMPORAL_ADDRESS configuration.');
    }

    const taskQueue = this.configService.get<string>('temporal.taskQueue') || 'workflows';
    const workflowId = `snapshot-${snapshotId}`;

    try {
      this.logger.log(`Starting RunSnapshotWorkflow for snapshot ${snapshotId}`, {
        workflowId,
        taskQueue,
        snapshotId,
      });

      await this.client.workflow.start('RunSnapshotWorkflow', {
        taskQueue,
        workflowId,
        args: [{ snapshotId }],
      });

      this.logger.log(`RunSnapshotWorkflow started successfully for snapshot ${snapshotId}`, {
        workflowId,
        snapshotId,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to start RunSnapshotWorkflow for snapshot ${snapshotId}: ${err.message}`,
        err.stack,
        {
          workflowId,
          taskQueue,
          snapshotId,
        },
      );
      throw error;
    }
  }
}

