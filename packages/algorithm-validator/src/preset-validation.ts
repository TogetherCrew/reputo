import { validateCSVContent } from './csv-validation.js';
import { validateJSONContent } from './json-validation.js';
import { validateCreateAlgorithmPreset } from './schemas/algorithm-preset.js';
import type { AlgorithmDefinition, AlgorithmPresetValidationResult, CsvIoItem, JsonIoItem } from './types/index.js';
import { validatePayload } from './validation.js';

type FileBackedInput = CsvIoItem | JsonIoItem;
type ResolvedInputContent = File | string | Buffer;

export interface ResolveInputContentArgs {
  input: FileBackedInput;
  value: unknown;
}

export interface ValidateAlgorithmPresetArgs {
  definition: AlgorithmDefinition;
  preset: unknown;
  resolveInputContent?: (args: ResolveInputContentArgs) => Promise<ResolvedInputContent | unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildPayload(inputs: Array<{ key: string; value: unknown }>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const input of inputs) {
    payload[input.key] = input.value;
  }

  return payload;
}

function hasBufferSupport(): boolean {
  return typeof Buffer !== 'undefined';
}

function isBufferValue(value: unknown): value is Buffer {
  return hasBufferSupport() && Buffer.isBuffer(value);
}

function isFileValue(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

async function readResolvedContent(content: ResolvedInputContent): Promise<string> {
  if (typeof content === 'string') {
    return content;
  }

  if (isBufferValue(content)) {
    return content.toString('utf-8');
  }

  return content.text();
}

async function parseResolvedJson(content: ResolvedInputContent): Promise<unknown> {
  return JSON.parse(await readResolvedContent(content));
}

function getFileBackedInputs(definition: AlgorithmDefinition): FileBackedInput[] {
  return definition.inputs.filter((input): input is FileBackedInput => input.type === 'csv' || input.type === 'json');
}

function getUnsupportedInputErrors(params: {
  definition: AlgorithmDefinition;
  inputs: Array<{ key: string; value: unknown }>;
}): NonNullable<AlgorithmPresetValidationResult['errors']> {
  const supportedKeys = new Set(params.definition.inputs.map((input) => input.key));
  const errors: NonNullable<AlgorithmPresetValidationResult['errors']> = [];

  for (const input of params.inputs) {
    if (supportedKeys.has(input.key)) {
      continue;
    }

    errors.push({
      field: input.key,
      message: `Input "${input.key}" is not supported by ${params.definition.key}@${params.definition.version}. Recreate the preset using the current algorithm definition.`,
      source: 'definition',
    });
  }

  return errors;
}

function getDuplicateInputErrors(
  inputs: Array<{ key: string; value: unknown }>,
): NonNullable<AlgorithmPresetValidationResult['errors']> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const input of inputs) {
    if (seen.has(input.key)) {
      duplicates.add(input.key);
      continue;
    }
    seen.add(input.key);
  }

  return [...duplicates].map((key) => ({
    field: key,
    message: `Input "${key}" must only be provided once`,
    source: 'preset' as const,
  }));
}

function getDefinitionConsistencyErrors(params: {
  definition: AlgorithmDefinition;
  key: string;
  version: string;
}): NonNullable<AlgorithmPresetValidationResult['errors']> {
  const errors: NonNullable<AlgorithmPresetValidationResult['errors']> = [];

  if (params.key !== params.definition.key) {
    errors.push({
      field: 'key',
      message: `Preset key must match ${params.definition.key}`,
      source: 'definition',
    });
  }

  if (params.version !== params.definition.version) {
    errors.push({
      field: 'version',
      message: `Preset version must match ${params.definition.version}`,
      source: 'definition',
    });
  }

  return errors;
}

async function resolveInputContent(params: {
  input: FileBackedInput;
  value: unknown;
  resolve?: ValidateAlgorithmPresetArgs['resolveInputContent'];
}): Promise<ResolvedInputContent> {
  const resolvedValue =
    typeof params.resolve === 'function'
      ? await params.resolve({ input: params.input, value: params.value })
      : params.value;

  if (typeof resolvedValue === 'string' || isBufferValue(resolvedValue) || isFileValue(resolvedValue)) {
    return resolvedValue;
  }

  throw new Error(`Unable to resolve ${params.input.label ?? params.input.key} content for validation`);
}

function getSelectedChains(selectorValue: unknown, selectorChainField: string): string[] {
  if (!Array.isArray(selectorValue)) {
    return [];
  }

  const chains = new Set<string>();
  for (const item of selectorValue) {
    if (!isRecord(item)) {
      continue;
    }
    const chainValue = item[selectorChainField];
    if (typeof chainValue === 'string' && chainValue.trim() !== '') {
      chains.add(chainValue);
    }
  }

  return [...chains];
}

function runJsonChainCoverageRule(params: {
  definition: AlgorithmDefinition;
  rule: {
    walletInputKey: string;
    selectorInputKey: string;
    selectorChainField: string;
  };
  payload: Record<string, unknown>;
  parsedJsonInputs: Record<string, unknown>;
}): NonNullable<AlgorithmPresetValidationResult['errors']> {
  const walletInput = params.definition.inputs.find(
    (input): input is JsonIoItem => input.key === params.rule.walletInputKey && input.type === 'json',
  );
  if (!walletInput) {
    return [
      {
        field: params.rule.walletInputKey,
        message: `Validation rule references unknown JSON input "${params.rule.walletInputKey}"`,
        source: 'rule',
      },
    ];
  }

  const selectedChains = getSelectedChains(
    params.payload[params.rule.selectorInputKey],
    params.rule.selectorChainField,
  );
  if (selectedChains.length === 0) {
    return [];
  }

  const parsedWalletInput = params.parsedJsonInputs[params.rule.walletInputKey];
  if (!isRecord(parsedWalletInput)) {
    return [];
  }

  const rootKey = walletInput.json?.rootKey ?? 'wallets';
  const walletsByChain = parsedWalletInput[rootKey];
  if (!isRecord(walletsByChain)) {
    return [];
  }

  const missingChains = selectedChains.filter((chain) => {
    const wallets = walletsByChain[chain];
    return !Array.isArray(wallets) || wallets.length === 0;
  });

  if (missingChains.length === 0) {
    return [];
  }

  return [
    {
      field: params.rule.walletInputKey,
      message: `Wallet JSON is missing wallet addresses for selected chain(s): ${missingChains.join(', ')}`,
      source: 'rule',
    },
  ];
}

function runDefinitionRules(params: {
  definition: AlgorithmDefinition;
  payload: Record<string, unknown>;
  parsedJsonInputs: Record<string, unknown>;
}): NonNullable<AlgorithmPresetValidationResult['errors']> {
  const rules = params.definition.validation?.rules ?? [];
  const errors: NonNullable<AlgorithmPresetValidationResult['errors']> = [];

  for (const rule of rules) {
    switch (rule.kind) {
      case 'json_chain_coverage':
        errors.push(
          ...runJsonChainCoverageRule({
            definition: params.definition,
            rule,
            payload: params.payload,
            parsedJsonInputs: params.parsedJsonInputs,
          }),
        );
        break;
    }
  }

  return errors;
}

export async function validateAlgorithmPreset({
  definition,
  preset,
  resolveInputContent: resolve,
}: ValidateAlgorithmPresetArgs): Promise<AlgorithmPresetValidationResult> {
  const presetResult = validateCreateAlgorithmPreset(preset);
  if (!presetResult.success) {
    return {
      success: false,
      errors: presetResult.error.issues.map((issue) => ({
        field: issue.path.join('.') || '_preset',
        message: issue.message,
        source: 'preset',
        code: issue.code,
      })),
    };
  }

  const definitionErrors = [
    ...getDefinitionConsistencyErrors({
      definition,
      key: presetResult.data.key,
      version: presetResult.data.version,
    }),
    ...getDuplicateInputErrors(presetResult.data.inputs),
    ...getUnsupportedInputErrors({
      definition,
      inputs: presetResult.data.inputs,
    }),
  ];

  const payload = buildPayload(presetResult.data.inputs);
  const payloadResult = validatePayload(definition, payload);
  const payloadErrors = payloadResult.success
    ? []
    : (payloadResult.errors ?? []).map((error) => ({
        ...error,
        source: 'payload' as const,
      }));

  if (definitionErrors.length > 0 || payloadErrors.length > 0) {
    return {
      success: false,
      errors: [...definitionErrors, ...payloadErrors],
    };
  }

  const fileErrors: NonNullable<AlgorithmPresetValidationResult['errors']> = [];
  const parsedJsonInputs: Record<string, unknown> = {};

  for (const input of getFileBackedInputs(definition)) {
    const presetInput = presetResult.data.inputs.find((item) => item.key === input.key);
    if (!presetInput || presetInput.value === undefined || presetInput.value === null || presetInput.value === '') {
      continue;
    }

    try {
      const content = await resolveInputContent({
        input,
        value: presetInput.value,
        resolve,
      });

      if (input.type === 'csv') {
        const result = await validateCSVContent(content, input.csv);
        if (!result.valid) {
          fileErrors.push(
            ...result.errors.map((message) => ({
              field: input.key,
              message,
              source: 'file' as const,
            })),
          );
        }
      }

      if (input.type === 'json') {
        const result = await validateJSONContent(content, input.json);
        if (!result.valid) {
          fileErrors.push(
            ...result.errors.map((message) => ({
              field: input.key,
              message,
              source: 'file' as const,
            })),
          );
          continue;
        }

        parsedJsonInputs[input.key] = await parseResolvedJson(content);
      }
    } catch (error) {
      fileErrors.push({
        field: input.key,
        message: error instanceof Error ? error.message : 'Unable to validate file input',
        source: 'file',
      });
    }
  }

  const ruleErrors = runDefinitionRules({
    definition,
    payload,
    parsedJsonInputs,
  });

  if (fileErrors.length > 0 || ruleErrors.length > 0) {
    return {
      success: false,
      errors: [...fileErrors, ...ruleErrors],
    };
  }

  return {
    success: true,
    data: {
      preset: presetResult.data,
      payload,
    },
  };
}
