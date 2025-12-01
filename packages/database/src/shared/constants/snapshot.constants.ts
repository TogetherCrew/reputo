export const SNAPSHOT_STATUS = ['queued', 'running', 'completed', 'failed', 'cancelled'] as const;

export type SnapshotStatus = (typeof SNAPSHOT_STATUS)[number];
