import { faker } from '@faker-js/faker';
import type { Document, Model } from 'mongoose';

type AlgorithmPresetFrozen = {
  key: string;
  version: string;
  inputs: Array<{ key: string; value?: unknown }>;
  name?: string;
  description?: string;
};

export type SnapshotCreate = {
  algorithmPreset: string;
  algorithmPresetFrozen: AlgorithmPresetFrozen;
  temporal?: {
    workflowId?: string;
    runId?: string;
    taskQueue?: string;
  };
  outputs?: unknown;
};

export type SnapshotCreateDto = {
  algorithmPresetId: string;
  temporal?: {
    workflowId?: string;
    runId?: string;
    taskQueue?: string;
  };
  outputs?: unknown;
};

export function makeSnapshot(
  algorithmPreset: string,
  algorithmPresetFrozen: AlgorithmPresetFrozen,
  overrides: Partial<Omit<SnapshotCreate, 'algorithmPreset' | 'algorithmPresetFrozen'>> = {},
): SnapshotCreate {
  return {
    algorithmPreset,
    algorithmPresetFrozen,
    temporal: overrides.temporal,
    outputs: overrides.outputs,
  };
}

export function makeSnapshotDto(
  algorithmPresetId: string,
  overrides: Partial<Omit<SnapshotCreateDto, 'algorithmPresetId'>> = {},
): SnapshotCreateDto {
  return {
    algorithmPresetId,
    temporal: overrides.temporal,
    outputs: overrides.outputs,
  };
}

export async function insertSnapshot<T extends Document>(
  model: Model<T>,
  algorithmPreset: string,
  algorithmPresetFrozen: AlgorithmPresetFrozen,
  overrides: Partial<Omit<SnapshotCreate, 'algorithmPreset' | 'algorithmPresetFrozen'>> = {},
): Promise<T> {
  const dto = makeSnapshot(algorithmPreset, algorithmPresetFrozen, overrides);
  const doc = await model.create(dto as any);
  return doc;
}

export function randomSnapshot(algorithmPreset: string, algorithmPresetFrozen: AlgorithmPresetFrozen): SnapshotCreate {
  const maybe = <T>(val: T) => (faker.datatype.boolean() ? val : undefined);
  return makeSnapshot(algorithmPreset, algorithmPresetFrozen, {
    temporal: maybe({
      workflowId: faker.string.alphanumeric(20),
      runId: faker.string.alphanumeric(10),
      taskQueue: 'algorithms',
    }),
    outputs: maybe({
      csv: faker.string.alphanumeric(16),
    }),
  });
}
