export const SnapshotStatus = {
  queued: 'queued',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
} as const;

export type SnapshotStatus = (typeof SnapshotStatus)[keyof typeof SnapshotStatus];

export const SNAPSHOT_STATUS = Object.values(SnapshotStatus);
