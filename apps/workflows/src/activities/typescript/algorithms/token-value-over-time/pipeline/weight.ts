const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeLotAgeDays(receivedAt: string | null, snapshotCreatedAt: Date | string): number {
  if (!receivedAt) return 0;
  const receivedTs = Date.parse(receivedAt);
  if (Number.isNaN(receivedTs)) return 0;
  const snapshotTs =
    typeof snapshotCreatedAt === 'string' ? new Date(snapshotCreatedAt).getTime() : snapshotCreatedAt.getTime();
  if (Number.isNaN(snapshotTs)) return 0;
  const ageMs = snapshotTs - receivedTs;
  if (ageMs <= 0) return 0;
  return ageMs / MS_PER_DAY;
}

export function computeLinearWeight(ageDays: number, maturationThresholdDays: number): number {
  if (maturationThresholdDays <= 0) return 1;
  if (ageDays <= 0) return 0;
  return Math.min(1, ageDays / maturationThresholdDays);
}
