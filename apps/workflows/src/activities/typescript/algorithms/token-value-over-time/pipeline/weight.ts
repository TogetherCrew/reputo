const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeLotAgeDays(receivedAt: string | null, snapshotCreatedAt: Date): number {
  if (!receivedAt) return 0;
  const receivedTs = Date.parse(receivedAt);
  const snapshotTs = snapshotCreatedAt.getTime();
  const ageMs = snapshotTs - receivedTs;
  if (ageMs <= 0) return 0;
  return ageMs / MS_PER_DAY;
}

export function computeLinearWeight(ageDays: number, maturationThresholdDays: number): number {
  if (maturationThresholdDays <= 0) return 1;
  if (ageDays <= 0) return 0;
  return Math.min(1, ageDays / maturationThresholdDays);
}
