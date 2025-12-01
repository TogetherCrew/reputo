export function keyToDisplayName(key: string): string {
  return key
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface TemplateConfig {
  readonly category?: string;
  readonly includeExampleInput?: boolean;
  readonly includeExampleOutput?: boolean;
  readonly customDescription?: string;
}

const DEFAULT_TEMPLATE_CONFIG: Required<TemplateConfig> = {
  category: 'custom',
  includeExampleInput: true,
  includeExampleOutput: true,
  customDescription: 'TODO: Add algorithm description',
} as const;

function createDefaultInput(): unknown {
  return {
    key: 'input_data',
    label: 'Input Data',
    description: 'TODO: Describe input data',
    type: 'csv',
    csv: {
      hasHeader: true,
      delimiter: ',',
      columns: [
        {
          key: 'example_column',
          type: 'string',
          description: 'TODO: Describe column',
        },
      ],
    },
  };
}

function createDefaultOutput(): unknown {
  return {
    key: 'result',
    label: 'Result',
    type: 'score_map',
    entity: 'user',
    description: 'TODO: Describe output',
  };
}

export function createAlgorithmTemplate(key: string, version: string, config: TemplateConfig = {}): unknown {
  const finalConfig = { ...DEFAULT_TEMPLATE_CONFIG, ...config };

  const inputs: unknown[] = finalConfig.includeExampleInput ? [createDefaultInput()] : [];
  const outputs: unknown[] = finalConfig.includeExampleOutput ? [createDefaultOutput()] : [];

  return {
    key,
    name: keyToDisplayName(key),
    category: finalConfig.category,
    description: finalConfig.customDescription,
    version,
    inputs,
    outputs,
    runtime: {
      taskQueue: 'typescript-worker',
      activity: key,
    },
  };
}
