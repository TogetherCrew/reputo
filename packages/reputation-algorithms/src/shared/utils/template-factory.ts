import { keyToDisplayName } from './formatting.js';
/**
 * Template configuration interface for customization
 */
export interface TemplateConfig {
  readonly category?: string;
  readonly includeExampleInput?: boolean;
  readonly includeExampleOutput?: boolean;
  readonly customDescription?: string;
}

/**
 * Default template configuration
 */
const DEFAULT_TEMPLATE_CONFIG: Required<TemplateConfig> = {
  category: 'custom',
  includeExampleInput: true,
  includeExampleOutput: true,
  customDescription: 'TODO: Add algorithm description',
} as const;

/**
 * Creates default input template
 */
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

/**
 * Creates default output template
 */
function createDefaultOutput(): unknown {
  return {
    key: 'result',
    label: 'Result',
    type: 'score_map',
    entity: 'user',
    description: 'TODO: Describe output',
  };
}

/**
 * Creates algorithm definition template with customizable options
 */
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
  };
}
