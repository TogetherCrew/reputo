import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnapshotEventsService } from '../../../src/snapshot/snapshot-events.service';

function createChangeStream() {
  const handlers = new Map<string, (payload: unknown) => void>();

  return {
    handlers,
    stream: {
      on: vi.fn((event: string, handler: (payload: unknown) => void) => {
        handlers.set(event, handler);
        return undefined;
      }),
      close: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('SnapshotEventsService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-06T12:00:00.000Z'));
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('watches snapshot changes and emits matching events to filtered subscribers', () => {
    const { handlers, stream } = createChangeStream();
    const snapshotModel = {
      watch: vi.fn().mockReturnValue(stream),
    };
    const service = new SnapshotEventsService(snapshotModel as never);
    const events: Array<Record<string, unknown>> = [];

    service.onModuleInit();

    const subscription = service
      .subscribe({ algorithmPreset: 'preset-1' })
      .subscribe((event) => events.push(event as unknown as Record<string, unknown>));

    handlers.get('change')?.({
      fullDocument: {
        _id: 'snapshot-1',
        status: 'running',
        algorithmPreset: 'preset-1',
        outputs: { csv: 'uploads/result.csv' },
        startedAt: new Date('2026-03-06T11:59:00.000Z'),
        completedAt: new Date('2026-03-06T12:00:00.000Z'),
      },
    });
    handlers.get('change')?.({
      fullDocument: {
        _id: 'snapshot-2',
        status: 'running',
        algorithmPreset: 'preset-2',
      },
    });

    expect(snapshotModel.watch).toHaveBeenCalledWith(
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
    expect(events).toEqual([
      {
        type: 'snapshot:updated',
        data: {
          _id: 'snapshot-1',
          status: 'running',
          algorithmPreset: 'preset-1',
          outputs: { csv: 'uploads/result.csv' },
          startedAt: '2026-03-06T11:59:00.000Z',
          completedAt: '2026-03-06T12:00:00.000Z',
          updatedAt: '2026-03-06T12:00:00.000Z',
        },
      },
    ]);

    subscription.unsubscribe();
    expect((service as { clients: Map<string, unknown> }).clients.size).toBe(0);
  });

  it('retries after transient change-stream errors', () => {
    const first = createChangeStream();
    const second = createChangeStream();
    const snapshotModel = {
      watch: vi.fn().mockReturnValueOnce(first.stream).mockReturnValueOnce(second.stream),
    };
    const service = new SnapshotEventsService(snapshotModel as never);

    service.onModuleInit();
    first.handlers.get('error')?.(new Error('transient failure'));

    vi.advanceTimersByTime(5000);

    expect(snapshotModel.watch).toHaveBeenCalledTimes(2);
  });

  it('does not retry replica-set errors and cleans up on destroy', async () => {
    const { handlers, stream } = createChangeStream();
    const snapshotModel = {
      watch: vi.fn().mockReturnValue(stream),
    };
    const service = new SnapshotEventsService(snapshotModel as never);
    let completed = false;

    service.onModuleInit();

    const subscription = service.subscribe().subscribe({
      complete: () => {
        completed = true;
      },
    });

    handlers.get('error')?.(
      Object.assign(new Error('not running with replication, needs replica set'), {
        code: 40573,
      }),
    );
    vi.advanceTimersByTime(5000);

    expect(snapshotModel.watch).toHaveBeenCalledTimes(1);

    await service.onModuleDestroy();

    expect(completed).toBe(true);
    expect(stream.close).toHaveBeenCalledOnce();
    subscription.unsubscribe();
  });
});
