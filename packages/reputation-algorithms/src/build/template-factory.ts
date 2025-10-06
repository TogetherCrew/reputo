import type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmKey,
  IOItem,
  VersionString,
} from '../shared/types/index.js';

/**
 * Template configuration interface for customization
 */
export interface TemplateConfig {
  readonly category?: AlgorithmCategory;
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
 * Converts snake_case key to Title Case name
 */
export function keyToDisplayName(key: AlgorithmKey): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Creates default input template
 */
function createDefaultInput(): IOItem {
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
function createDefaultOutput(): IOItem {
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
export function createAlgorithmTemplate(
  key: AlgorithmKey,
  version: VersionString,
  config: TemplateConfig = {},
): AlgorithmDefinition {
  const finalConfig = { ...DEFAULT_TEMPLATE_CONFIG, ...config };

  const inputs: IOItem[] = finalConfig.includeExampleInput ? [createDefaultInput()] : [];
  const outputs: IOItem[] = finalConfig.includeExampleOutput ? [createDefaultOutput()] : [];

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

/**
 * Template factory class for more advanced use cases
 */
export class AlgorithmTemplateFactory {
  constructor(private readonly defaultConfig: TemplateConfig = {}) {}

  create(key: AlgorithmKey, version: VersionString, config?: TemplateConfig): AlgorithmDefinition {
    const mergedConfig = { ...this.defaultConfig, ...config };
    return createAlgorithmTemplate(key, version, mergedConfig);
  }

  withCategory(category: AlgorithmCategory): AlgorithmTemplateFactory {
    return new AlgorithmTemplateFactory({ ...this.defaultConfig, category });
  }

  withDescription(description: string): AlgorithmTemplateFactory {
    return new AlgorithmTemplateFactory({
      ...this.defaultConfig,
      customDescription: description,
    });
  }

  minimal(): AlgorithmTemplateFactory {
    return new AlgorithmTemplateFactory({
      ...this.defaultConfig,
      includeExampleInput: false,
      includeExampleOutput: false,
    });
  }
}
