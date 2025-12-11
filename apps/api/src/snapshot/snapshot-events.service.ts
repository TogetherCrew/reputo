import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SnapshotModel } from '@reputo/database';
import { MODEL_NAMES } from '@reputo/database';
import type { ChangeStreamUpdateDocument } from 'mongodb';
import { filter, Observable, Subject } from 'rxjs';
import type { SnapshotEventDto } from './dto';

interface SnapshotChangeDocument {
  _id: string;
  status: string;
  algorithmPreset: string;
  outputs?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  updatedAt?: Date;
}

interface ClientSubscription {
  subject: Subject<SnapshotEventDto>;
  filter?: {
    algorithmPreset?: string;
  };
}

@Injectable()
export class SnapshotEventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SnapshotEventsService.name);
  private changeStream: ReturnType<SnapshotModel['watch']> | null = null;
  private clients = new Map<string, ClientSubscription>();
  private initAttempts = 0;
  private readonly maxInitAttempts = 3;

  constructor(
    @InjectModel(MODEL_NAMES.SNAPSHOT)
    private readonly snapshotModel: SnapshotModel,
  ) {}

  onModuleInit() {
    this.initChangeStream();
  }

  async onModuleDestroy() {
    // Close all client subjects
    for (const [clientId, subscription] of this.clients) {
      subscription.subject.complete();
      this.clients.delete(clientId);
    }

    // Close change stream
    if (this.changeStream) {
      await this.changeStream.close();
      this.changeStream = null;
      this.logger.log('Change stream closed');
    }
  }

  private initChangeStream() {
    // Don't retry forever if change streams aren't supported
    if (this.initAttempts >= this.maxInitAttempts) {
      this.logger.warn(
        'MongoDB Change Streams not available. Real-time snapshot updates disabled. ' +
          'Change Streams require a MongoDB replica set. ' +
          'For local development, consider using MongoDB Atlas or configuring a local replica set.',
      );
      return;
    }

    this.initAttempts++;

    try {
      // Watch for update and replace operations on the snapshots collection
      this.changeStream = this.snapshotModel.watch(
        [
          {
            $match: {
              operationType: { $in: ['update', 'replace'] },
            },
          },
        ],
        {
          fullDocument: 'updateLookup',
        },
      );

      this.changeStream.on('change', (change) => {
        this.handleChange(change as unknown as ChangeStreamUpdateDocument<SnapshotChangeDocument>);
      });

      this.changeStream.on('error', (error) => {
        const err = error as Error & { code?: number };
        // Check if it's a replica set error (code 40573 = "not running with replication")
        if (err.code === 40573 || err.message?.includes('replica set')) {
          this.logger.warn('MongoDB Change Streams require a replica set. Real-time snapshot updates disabled.');
          return;
        }

        this.logger.error(`Change stream error: ${err.message}`, err.stack);

        // Attempt to reconnect after a delay for transient errors
        setTimeout(() => this.initChangeStream(), 5000);
      });

      this.initAttempts = 0; // Reset on success
      this.logger.log('MongoDB Change Stream initialized for snapshots collection');
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to initialize change stream: ${err.message}`, err.stack);

      // Retry after delay
      setTimeout(() => this.initChangeStream(), 5000);
    }
  }

  private handleChange(change: ChangeStreamUpdateDocument<SnapshotChangeDocument>) {
    const fullDocument = change.fullDocument;
    if (!fullDocument) {
      return;
    }

    const event: SnapshotEventDto = {
      type: 'snapshot:updated',
      data: {
        _id: fullDocument._id.toString(),
        status: fullDocument.status as SnapshotEventDto['data']['status'],
        algorithmPreset:
          typeof fullDocument.algorithmPreset === 'object'
            ? (fullDocument.algorithmPreset as { _id: string })._id?.toString()
            : fullDocument.algorithmPreset?.toString(),
        outputs: fullDocument.outputs,
        startedAt: fullDocument.startedAt?.toISOString(),
        completedAt: fullDocument.completedAt?.toISOString(),
        updatedAt: fullDocument.updatedAt?.toISOString() ?? new Date().toISOString(),
      },
    };

    this.broadcast(event);
  }

  private broadcast(event: SnapshotEventDto) {
    this.logger.debug(`Broadcasting event for snapshot ${event.data._id}`, {
      status: event.data.status,
      clientCount: this.clients.size,
    });

    for (const [, subscription] of this.clients) {
      subscription.subject.next(event);
    }
  }

  /**
   * Subscribe to snapshot events with optional filtering.
   * Returns an Observable that emits SnapshotEventDto when matching snapshots change.
   */
  subscribe(options?: { algorithmPreset?: string }): Observable<SnapshotEventDto> {
    const clientId = randomUUID();
    const subject = new Subject<SnapshotEventDto>();

    this.clients.set(clientId, {
      subject,
      filter: options,
    });

    this.logger.log(`Client ${clientId} subscribed`, { filter: options });

    // Create filtered observable
    let observable = subject.asObservable();

    if (options?.algorithmPreset) {
      observable = observable.pipe(filter((event) => event.data.algorithmPreset === options.algorithmPreset));
    }

    // Clean up on unsubscribe
    return new Observable((subscriber) => {
      const subscription = observable.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        subject.complete();
        this.clients.delete(clientId);
        this.logger.log(`Client ${clientId} unsubscribed`);
      };
    });
  }
}
