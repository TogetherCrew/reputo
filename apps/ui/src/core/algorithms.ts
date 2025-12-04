import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
  getAlgorithmDefinitionKeys,
  searchAlgorithmDefinitions,
} from "@reputo/reputation-algorithms"

// Transform the AlgorithmDefinition from the package to match the UI's expected format
export interface Algorithm {
  id: string
  title: string
  category: string
  description: string
  duration: string
  dependencies: string
  level: string
  inputs: Array<{
    type: string
    label: string
  }>
}

// Transform AlgorithmDefinition to UI Algorithm format
function transformAlgorithm(definition: AlgorithmDefinition): Algorithm {
  return {
    id: definition.key,
    title: definition.name,
    category:
      definition.category === "Engagement"
        ? "Core Engagement"
        : definition.category === "Activity"
          ? "Core Engagement"
          : "Custom",
    description: definition.description,
    duration: "~2-5 min", // Default duration since it's not in the definition
    dependencies: `${definition.inputs.length} input${
      definition.inputs.length !== 1 ? "s" : ""
    }`,
    level: "Intermediate", // Default level since it's not in the definition
    inputs: definition.inputs.map((input) => ({
      type: input.type,
      label: input.label || input.key,
    })),
  }
}

/**
 * Get all algorithms from the registry.
 *
 * @returns Array of all algorithms
 */
function getAllAlgorithms(): Algorithm[] {
  try {
    const keys = getAlgorithmDefinitionKeys()
    const algorithms: Algorithm[] = []

    for (const key of keys) {
      try {
        const definitionJson = getAlgorithmDefinition({ key })
        const definition = JSON.parse(definitionJson) as AlgorithmDefinition
        algorithms.push(transformAlgorithm(definition))
      } catch (error) {
        console.error(`Failed to load algorithm ${key}:`, error)
      }
    }

    return algorithms
  } catch (error) {
    console.error("Failed to get algorithms:", error)
    return []
  }
}

// Get all algorithms from the registry (cached for initial load)
export const algorithms: Algorithm[] = getAllAlgorithms()

// Helper function to get algorithm by ID
export function getAlgorithmById(id: string): Algorithm | undefined {
  return algorithms.find((algo) => algo.id === id)
}

/**
 * Search algorithms using the registry's search functionality.
 * Uses OR logic across filters: matches if key, name, or category matches.
 *
 * @param query - Search query string to match against key, name, and category
 * @returns Array of matching algorithms
 */
export function searchAlgorithms(query: string): Algorithm[] {
  if (!query.trim()) {
    return algorithms
  }

  try {
    // Search using OR logic - algorithm matches if any field matches
    const results = searchAlgorithmDefinitions({
      key: query,
      name: query,
      category: query,
    })

    return results.map((jsonStr) => {
      const definition = JSON.parse(jsonStr) as AlgorithmDefinition
      return transformAlgorithm(definition)
    })
  } catch (error) {
    console.error("Failed to search algorithms:", error)
    return []
  }
}

// Note: Form schemas are not registered in the reputoClient as they are UI-specific.
// Validation happens through buildZodSchema in the form component.
// To register actual algorithm definitions, use:
// const definition = getAlgorithmDefinition({ key: algorithm.id })
// reputoClient.registerSchema(JSON.parse(definition) as AlgorithmDefinition)
