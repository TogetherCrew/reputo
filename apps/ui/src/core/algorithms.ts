import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
  getAlgorithmDefinitionKeys,
  searchAlgorithmDefinitions,
} from "@reputo/reputation-algorithms"

/** Display labels for known algorithm dependency keys (e.g. external data sources) */
const DEPENDENCY_KEY_TO_LABEL: Record<string, string> = {
  "deepfunding-portal-api": "DeepFunding Portal API",
  "onchain-data": "Onchain Data",
  "onchain-data-service": "Onchain Data",
}

/** Per-algorithm display metadata not derived from the definition itself */
const ALGORITHM_META: Record<string, { duration: string; level: string }> = {
  contribution_score: { duration: "~3-6 min", level: "Intermediate" },
  proposal_engagement: { duration: "~2-4 min", level: "Beginner" },
  voting_engagement: { duration: "~1-3 min", level: "Beginner" },
  token_value_over_time: { duration: "~4-8 min", level: "Intermediate" },
}

const DEFAULT_META = { duration: "~2-5 min", level: "Intermediate" }

// Transform the AlgorithmDefinition from the package to match the UI's expected format
export interface Algorithm {
  id: string
  title: string
  category: string
  summary: string
  description: string
  duration: string
  inputSummary: string
  level: string
  inputs: Array<{
    key: string
    type: string
    label: string
  }>
  /** Labels for read-only dependencies (e.g. external APIs or indexed services). */
  dependencyLabels: string[]
}

function formatInputSummary(inputCount: number): string {
  return `${inputCount} configurable input${inputCount !== 1 ? "s" : ""}`
}

// Transform AlgorithmDefinition to UI Algorithm format
function transformAlgorithm(definition: AlgorithmDefinition): Algorithm {
  const dependencyLabels =
    definition.dependencies
      ?.map((dep) => DEPENDENCY_KEY_TO_LABEL[dep.key])
      .filter((label): label is string => Boolean(label)) ?? []

  const meta = ALGORITHM_META[definition.key] ?? DEFAULT_META

  return {
    id: definition.key,
    title: definition.name,
    category: definition.category, // Preserve original category
    summary: definition.summary,
    description: definition.description,
    duration: meta.duration,
    inputSummary: formatInputSummary(definition.inputs.length),
    level: meta.level,
    inputs: definition.inputs.map((input) => ({
      key: input.key,
      type: input.type,
      label: input.label || input.key,
    })),
    dependencyLabels,
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
