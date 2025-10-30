import {
  getAlgorithmDefinitionKeys,
  getAlgorithmDefinition,
  type AlgorithmDefinition,
} from '@reputo/reputation-algorithms';
import { reputoClient } from "./client";
import { buildSchemaFromAlgorithm } from "./schema-builder";

// Transform the AlgorithmDefinition from the package to match the UI's expected format
export interface Algorithm {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  dependencies: string;
  level: string;
  inputs: Array<{
    type: string;
    label: string;
  }>;
}

// Get all algorithm keys from the registry
const algorithmKeys = getAlgorithmDefinitionKeys();

// Transform AlgorithmDefinition to UI Algorithm format
function transformAlgorithm(definition: AlgorithmDefinition): Algorithm {
  return {
    id: definition.key,
    title: definition.name,
    category: definition.category === 'engagement' ? 'Core Engagement' : 
              definition.category === 'activity' ? 'Core Engagement' : 'Custom',
    description: definition.description,
    duration: '~2-5 min', // Default duration since it's not in the definition
    dependencies: `${definition.inputs.length} input${definition.inputs.length !== 1 ? 's' : ''}`,
    level: 'Intermediate', // Default level since it's not in the definition
    inputs: definition.inputs.map((input) => ({
      type: input.type,
      label: input.label || input.key,
    })),
  };
}

// Get all algorithms from the registry
export const algorithms: Algorithm[] = algorithmKeys.map((key: string) => {
  try {
    const definitionJson = getAlgorithmDefinition({ key });
    const definition = JSON.parse(definitionJson) as AlgorithmDefinition;
    return transformAlgorithm(definition);
  } catch (error) {
    console.error(`Failed to load algorithm ${key}:`, error);
    // Return a fallback algorithm
    return {
      id: key,
      title: key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      category: 'Custom',
      description: 'Algorithm definition could not be loaded',
      duration: '~2-5 min',
      dependencies: 'Unknown',
      level: 'Unknown',
      inputs: [],
    };
  }
});

// Helper function to get algorithm by ID
export function getAlgorithmById(id: string): Algorithm | undefined {
  return algorithms.find(algo => algo.id === id);
}

// Auto-register all algorithm schemas when module loads
algorithms.forEach((algorithm) => {
  try {
    const schema = buildSchemaFromAlgorithm(algorithm);
    reputoClient.registerSchema(schema);
  } catch (error) {
    console.error(`Failed to register schema for ${algorithm.id}:`, error);
  }
});
