import { algorithmPythonTaskQueue, algorithmTypescriptTaskQueue } from '../constants/index.js';

interface PresetInputLike {
  key: string;
  value?: unknown;
}

interface AlgorithmPresetFrozenLike {
  inputs: PresetInputLike[];
}

interface CombinedAlgorithmDefinitionLike {
  inputs?: Array<{
    key: string;
    type?: string;
    sharedInputKeys?: string[];
  }>;
}

interface SubAlgorithmEntryLike {
  algorithm_key: string;
  algorithm_version: string;
  weight: number;
  inputs: PresetInputLike[];
}

interface CombinedChildAlgorithmPreset {
  key: string;
  version: string;
  inputs: PresetInputLike[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPresetInputLike(value: unknown): value is PresetInputLike {
  return isRecord(value) && typeof value.key === 'string';
}

function isSubAlgorithmEntryLike(value: unknown): value is SubAlgorithmEntryLike {
  return (
    isRecord(value) &&
    typeof value.algorithm_key === 'string' &&
    typeof value.algorithm_version === 'string' &&
    typeof value.weight === 'number' &&
    Array.isArray(value.inputs) &&
    value.inputs.every(isPresetInputLike)
  );
}

export function getAlgorithmTaskQueueFromRuntime(runtime: unknown): string {
  if (runtime === 'typescript') {
    return algorithmTypescriptTaskQueue;
  }
  if (runtime === 'python') {
    return algorithmPythonTaskQueue;
  }
  throw new Error(`Unsupported algorithm runtime: ${String(runtime)}`);
}

export function buildCombinedChildAlgorithmPresets(
  preset: AlgorithmPresetFrozenLike,
  definition: CombinedAlgorithmDefinitionLike,
): CombinedChildAlgorithmPreset[] {
  const childPresets: CombinedChildAlgorithmPreset[] = [];

  for (const inputDefinition of definition.inputs ?? []) {
    if (inputDefinition.type !== 'sub_algorithm') {
      continue;
    }

    const sharedInputKeys = new Set(inputDefinition.sharedInputKeys ?? []);
    const sharedInputs = preset.inputs.filter((presetInput) => sharedInputKeys.has(presetInput.key));
    const rawEntries = preset.inputs.find((presetInput) => presetInput.key === inputDefinition.key)?.value;

    if (!Array.isArray(rawEntries)) {
      continue;
    }

    for (const rawEntry of rawEntries) {
      if (!isSubAlgorithmEntryLike(rawEntry)) {
        continue;
      }

      childPresets.push({
        key: rawEntry.algorithm_key,
        version: rawEntry.algorithm_version,
        inputs: [...rawEntry.inputs.filter((childInput) => !sharedInputKeys.has(childInput.key)), ...sharedInputs],
      });
    }
  }

  return childPresets;
}
