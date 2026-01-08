export interface TimeWeightParams {
  engagementWindowMonths: number;
  monthlyDecayRatePercent: number;
  decayBucketSizeMonths: number;
}

export interface TimeWeightResult {
  tw: number;
  ageMonths: number;
  bucketIndex: number;
  isValid: boolean;
  isWithinWindow: boolean;
}

/**
 * Calculate time weight based on comment age and decay parameters.
 *
 * The time weight decays in discrete buckets:
 * - Bucket 0: tw = 1.0
 * - Bucket 1: tw = 1.0 - decay_rate
 * - Bucket n: tw = 1.0 - n * decay_rate
 *
 * Comments outside the engagement window get tw = 0.
 *
 * @param createdAt - Comment creation date
 * @param now - Current date for age calculation
 * @param params - Time weight parameters
 * @returns Time weight result with tw, age, and bucket info
 */
export function calculateTimeWeight(createdAt: Date, now: Date, params: TimeWeightParams): TimeWeightResult {
  const { engagementWindowMonths, monthlyDecayRatePercent, decayBucketSizeMonths } = params;

  const isValid = !Number.isNaN(createdAt.getTime());
  if (!isValid) {
    return {
      tw: 0,
      ageMonths: 0,
      bucketIndex: 0,
      isValid: false,
      isWithinWindow: false,
    };
  }

  const ageMs = now.getTime() - createdAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44);

  if (ageMonths >= engagementWindowMonths) {
    return {
      tw: 0,
      ageMonths,
      bucketIndex: Math.floor(ageMonths / decayBucketSizeMonths),
      isValid: true,
      isWithinWindow: false,
    };
  }

  const bucketIndex = Math.floor(ageMonths / decayBucketSizeMonths);
  const tw = Math.max(0, 1 - bucketIndex * (monthlyDecayRatePercent / 100));

  return {
    tw,
    ageMonths,
    bucketIndex,
    isValid: true,
    isWithinWindow: tw > 0,
  };
}

/**
 * Parse and validate a date string, computing time weight if valid.
 *
 * @param createdAtStr - ISO date string
 * @param now - Current date
 * @param params - Time weight parameters
 * @returns Time weight result
 */
export function computeTimeWeightFromString(
  createdAtStr: string,
  now: Date,
  params: TimeWeightParams,
): TimeWeightResult {
  const createdAt = new Date(createdAtStr);
  return calculateTimeWeight(createdAt, now, params);
}
